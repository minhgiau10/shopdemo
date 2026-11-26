import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto.js';
import {
  ReserveInventoryDto,
  ReserveItemDto,
} from './dto/reserve-inventory.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const stocks = await this.prisma.inventory.findMany();
    return stocks.map((s) => ({
      ...s,
      isLowStock: s.availableQuantity <= s.lowStockThreshold,
    }));
  }

  async findByProductId(productId: string) {
    const stock = await this.prisma.inventory.findUnique({
      where: { productId },
    });
    if (!stock) {
      throw new NotFoundException(
        `Chưa có dữ liệu kho cho sản phẩm ${productId}`,
      );
    }
    return {
      ...stock,
      isLowStock: stock.availableQuantity <= stock.lowStockThreshold,
    };
  }

  async importStock(dto: UpsertInventoryDto) {
    return this.prisma.inventory.upsert({
      where: { productId: dto.productId },
      update: {
        availableQuantity: { increment: dto.quantity },
        ...(dto.sku && { sku: dto.sku }),
        ...(dto.warehouseLocation && {
          warehouseLocation: dto.warehouseLocation,
        }),
        ...(dto.lowStockThreshold !== undefined && {
          lowStockThreshold: dto.lowStockThreshold,
        }),
      },
      create: {
        productId: dto.productId,
        sku: dto.sku,
        warehouseLocation: dto.warehouseLocation ?? 'Kho chính HCM',
        availableQuantity: dto.quantity,
        reservedQuantity: 0,
        lowStockThreshold: dto.lowStockThreshold ?? 5,
      },
    });
  }

  async reserveStock(dto: ReserveInventoryDto) {
    const existing = await this.prisma.inventoryReservation.findUnique({
      where: { orderId: dto.orderId },
    });
    if (existing) {
      return {
        message: 'Đơn hàng đã được giữ kho trước đó',
        reservation: existing,
      };
    }

    const reservedSuccess: ReserveItemDto[] = [];

    try {
      for (const item of dto.items) {
        const result = await this.prisma.inventory.updateMany({
          where: {
            productId: item.productId,
            availableQuantity: { gte: item.quantity },
          },
          data: {
            availableQuantity: { decrement: item.quantity },
            reservedQuantity: { increment: item.quantity },
          },
        });

        if (result.count === 0) {
          throw new BadRequestException(
            `Sản phẩm ${item.productId} không đủ số lượng tồn kho`,
          );
        }

        reservedSuccess.push(item);
      }

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const reservation = await this.prisma.inventoryReservation.create({
        data: {
          orderId: dto.orderId,
          items: dto.items as any,
          status: 'RESERVED',
          expiresAt,
        },
      });

      return { message: 'Giữ kho thành công', reservation };
    } catch (error) {
      for (const item of reservedSuccess) {
        await this.prisma.inventory.updateMany({
          where: { productId: item.productId },
          data: {
            availableQuantity: { increment: item.quantity },
            reservedQuantity: { decrement: item.quantity },
          },
        });
      }
      throw error;
    }
  }

  async confirmStock(orderId: string) {
    const reservation = await this.prisma.inventoryReservation.findUnique({
      where: { orderId },
    });

    if (!reservation) {
      throw new NotFoundException(
        `Không tìm thấy phiếu giữ kho cho đơn ${orderId}`,
      );
    }

    if (reservation.status === 'CONFIRMED') {
      return { message: 'Đơn hàng đã được xuất kho trước đó' };
    }

    if (reservation.status !== 'RESERVED') {
      throw new BadRequestException(
        `Không thể xác nhận phiếu ở trạng thái ${reservation.status}`,
      );
    }

    const items = reservation.items as unknown as ReserveItemDto[];
    for (const item of items) {
      await this.prisma.inventory.updateMany({
        where: { productId: item.productId },
        data: {
          reservedQuantity: { decrement: item.quantity },
        },
      });
    }

    await this.prisma.inventoryReservation.update({
      where: { orderId },
      data: { status: 'CONFIRMED' },
    });

    return { message: 'Xác nhận trừ kho thành công', orderId };
  }

  async releaseStock(orderId: string) {
    const reservation = await this.prisma.inventoryReservation.findUnique({
      where: { orderId },
    });

    if (!reservation) {
      throw new NotFoundException(
        `Không tìm thấy phiếu giữ kho cho đơn ${orderId}`,
      );
    }

    if (reservation.status !== 'RESERVED') {
      return {
        message: `Trạng thái phiếu đang là ${reservation.status}, không thể nhả kho`,
      };
    }

    const items = reservation.items as unknown as ReserveItemDto[];
    for (const item of items) {
      await this.prisma.inventory.updateMany({
        where: { productId: item.productId },
        data: {
          availableQuantity: { increment: item.quantity },
          reservedQuantity: { decrement: item.quantity },
        },
      });
    }

    await this.prisma.inventoryReservation.update({
      where: { orderId },
      data: { status: 'RELEASED' },
    });

    return { message: 'Nhả kho thành công', orderId };
  }
}
