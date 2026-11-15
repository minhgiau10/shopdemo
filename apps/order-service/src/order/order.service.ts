import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrderService {
  private readonly inventoryUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.inventoryUrl =
      this.configService.get<string>('INVENTORY_SERVICE_URL') ||
      'http://localhost:3004';
  }

  // 1. Tạo đơn hàng + Giữ kho bên Inventory Service
  async createOrder(userId: string, dto: CreateOrderDto) {
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Bước 1: Tạo đơn hàng trạng thái PENDING kèm snapshot sản phẩm
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        shippingAddress: dto.shippingAddress,
        paymentMethod: dto.paymentMethod ?? 'COD',
        note: dto.note,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Bước 2: Gọi Inventory Service giữ hàng (Saga Orchestration)
    try {
      await firstValueFrom(
        this.httpService.post(`${this.inventoryUrl}/inventory/reserve`, {
          orderId: order.id,
          items: dto.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      );

      return order;
    } catch (error: any) {
      // Nếu giữ kho thất bại (hết hàng / lỗi kết nối) -> Hủy đơn vừa tạo
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });

      const reason =
        error?.response?.data?.message || 'Không đủ tồn kho để tạo đơn hàng';
      throw new BadRequestException(reason);
    }
  }

  // Lấy danh sách đơn của user đang đăng nhập
  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Lấy tất cả đơn (dành cho Admin)
  async findAll() {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Lấy chi tiết 1 đơn
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${id}`);
    }
    return order;
  }

  // 2. Xác nhận đơn / Thanh toán xong -> Chốt trừ kho thật
  async confirmOrder(id: string) {
    const order = await this.findOne(id);
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Không thể xác nhận đơn hàng ở trạng thái ${order.status}`,
      );
    }

    await firstValueFrom(
      this.httpService.post(`${this.inventoryUrl}/inventory/confirm/${id}`),
    );

    return this.prisma.order.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { items: true },
    });
  }

  // 3. Hủy đơn -> Nhả kho lại cho Inventory Service
  async cancelOrder(id: string) {
    const order = await this.findOne(id);
    if (order.status === 'CANCELLED' || order.status === 'COMPLETED') {
      throw new BadRequestException(
        `Không thể hủy đơn hàng ở trạng thái ${order.status}`,
      );
    }

    if (order.status === 'PENDING') {
      await firstValueFrom(
        this.httpService.post(`${this.inventoryUrl}/inventory/release/${id}`),
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });
  }
}