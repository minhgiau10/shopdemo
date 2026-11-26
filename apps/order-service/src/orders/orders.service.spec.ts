import { BadRequestException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrderService } from './order.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto.js';

describe('OrderService', () => {
  let service: OrderService;

  // Mock Prisma
  const prismaMock = {
    order: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  // Mock HttpService
  const httpServiceMock = {
    post: vi.fn(),
  };

  // Mock ConfigService
  const configServiceMock = {
    get: vi.fn(),
  };

  const createOrderDto: CreateOrderDto = {
    shippingAddress: '123 Nguyễn Trãi, Quận 1, TP.HCM',
    paymentMethod: 'COD',
    note: 'Giao hàng giờ hành chính',
    items: [
      {
        productId: 'product-001',
        sku: 'PHONE-001',
        productName: 'Điện thoại A',
        price: 10000000,
        quantity: 2,
      },
      {
        productId: 'product-002',
        sku: 'PHONE-002',
        productName: 'Điện thoại B',
        price: 5000000,
        quantity: 1,
      },
    ],
  };

  const mockOrder = {
    id: 'order-001',
    userId: 'user-001',
    totalAmount: 25000000,
    status: 'PENDING',
    shippingAddress: createOrderDto.shippingAddress,
    paymentMethod: 'COD',
    note: createOrderDto.note,
    items: createOrderDto.items,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mặc định không có INVENTORY_SERVICE_URL trong cấu hình
    configServiceMock.get.mockReturnValue(undefined);

    service = new OrderService(
      prismaMock as unknown as PrismaService,
      httpServiceMock as unknown as HttpService,
      configServiceMock as unknown as ConfigService,
    );
  });

  // UT-ORDER-01: Tạo đơn hàng thành công
  it('UT-ORDER-01: should create order successfully and reserve inventory', async () => {
    prismaMock.order.create.mockResolvedValue(mockOrder);
    httpServiceMock.post.mockReturnValue(of({ data: {} }));

    const result = await service.createOrder('user-001', createOrderDto);

    expect(result).toEqual(mockOrder);

    expect(prismaMock.order.create).toHaveBeenCalled();

    expect(httpServiceMock.post).toHaveBeenCalledWith(
      'http://localhost:3004/inventory/reserve',
      {
        orderId: 'order-001',
        items: [
          { productId: 'product-001', quantity: 2 },
          { productId: 'product-002', quantity: 1 },
        ],
      },
    );
  });

  // UT-ORDER-02: Tính tổng tiền đơn hàng
  it('UT-ORDER-02: should calculate total amount correctly', async () => {
    prismaMock.order.create.mockResolvedValue(mockOrder);
    httpServiceMock.post.mockReturnValue(of({ data: {} }));

    await service.createOrder('user-001', createOrderDto);

    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: 25000000,
        }),
      }),
    );
  });

  // UT-ORDER-03: Mặc định phương thức thanh toán là COD
  it('UT-ORDER-03: should use COD as default payment method', async () => {
    const dtoWithoutPaymentMethod: CreateOrderDto = {
      ...createOrderDto,
      paymentMethod: undefined,
    };

    prismaMock.order.create.mockResolvedValue(mockOrder);
    httpServiceMock.post.mockReturnValue(of({ data: {} }));

    await service.createOrder('user-001', dtoWithoutPaymentMethod);

    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentMethod: 'COD',
        }),
      }),
    );
  });

  // UT-ORDER-04: Hủy đơn khi Inventory giữ kho thất bại
  it('UT-ORDER-04: should cancel order when inventory reservation fails', async () => {
    prismaMock.order.create.mockResolvedValue(mockOrder);

    httpServiceMock.post.mockReturnValue(
      throwError(() => ({
        response: {
          data: {
            message: 'Sản phẩm không đủ tồn kho',
          },
        },
      })),
    );

    prismaMock.order.update.mockResolvedValue({
      ...mockOrder,
      status: 'CANCELLED',
    });

    await expect(
      service.createOrder('user-001', createOrderDto),
    ).rejects.toThrow('Sản phẩm không đủ tồn kho');

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'order-001' },
      data: { status: 'CANCELLED' },
    });
  });

  // UT-ORDER-05: Lấy danh sách đơn của người dùng
  it('UT-ORDER-05: should return orders of a specific user', async () => {
    prismaMock.order.findMany.mockResolvedValue([mockOrder]);

    const result = await service.findMyOrders('user-001');

    expect(result).toEqual([mockOrder]);

    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-001' },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  // UT-ORDER-06: Lấy tất cả đơn hàng
  it('UT-ORDER-06: should return all orders', async () => {
    prismaMock.order.findMany.mockResolvedValue([mockOrder]);

    const result = await service.findAll();

    expect(result).toEqual([mockOrder]);

    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  // UT-ORDER-07: Tìm đơn hàng tồn tại
  it('UT-ORDER-07: should return order when it exists', async () => {
    prismaMock.order.findUnique.mockResolvedValue(mockOrder);

    const result = await service.findOne('order-001');

    expect(result).toEqual(mockOrder);

    expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
      where: { id: 'order-001' },
      include: { items: true },
    });
  });

  // UT-ORDER-08: Không tìm thấy đơn hàng
  it('UT-ORDER-08: should throw NotFoundException when order does not exist', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);

    await expect(service.findOne('order-999')).rejects.toThrow(
      NotFoundException,
    );
  });

  // UT-ORDER-09: Xác nhận đơn hàng thành công
  it('UT-ORDER-09: should confirm a pending order successfully', async () => {
    prismaMock.order.findUnique.mockResolvedValue(mockOrder);

    httpServiceMock.post.mockReturnValue(of({ data: {} }));

    const confirmedOrder = {
      ...mockOrder,
      status: 'CONFIRMED',
    };

    prismaMock.order.update.mockResolvedValue(confirmedOrder);

    const result = await service.confirmOrder('order-001');

    expect(httpServiceMock.post).toHaveBeenCalledWith(
      'http://localhost:3004/inventory/confirm/order-001',
    );

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'order-001' },
      data: { status: 'CONFIRMED' },
      include: { items: true },
    });

    expect(result).toEqual(confirmedOrder);
  });

  // UT-ORDER-10: Không xác nhận đơn sai trạng thái
  it('UT-ORDER-10: should reject confirming an order that is not pending', async () => {
    const confirmedOrder = {
      ...mockOrder,
      status: 'CONFIRMED',
    };

    prismaMock.order.findUnique.mockResolvedValue(confirmedOrder);

    await expect(service.confirmOrder('order-001')).rejects.toThrow(
      BadRequestException,
    );

    expect(httpServiceMock.post).not.toHaveBeenCalled();
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  // UT-ORDER-11: Hủy đơn hàng đang PENDING
  it('UT-ORDER-11: should release inventory and cancel a pending order', async () => {
    prismaMock.order.findUnique.mockResolvedValue(mockOrder);

    httpServiceMock.post.mockReturnValue(of({ data: {} }));

    const cancelledOrder = {
      ...mockOrder,
      status: 'CANCELLED',
    };

    prismaMock.order.update.mockResolvedValue(cancelledOrder);

    const result = await service.cancelOrder('order-001');

    expect(httpServiceMock.post).toHaveBeenCalledWith(
      'http://localhost:3004/inventory/release/order-001',
    );

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'order-001' },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });

    expect(result).toEqual(cancelledOrder);
  });

  // UT-ORDER-12: Hủy đơn đã CONFIRMED
  it('UT-ORDER-12: should cancel a confirmed order without releasing inventory again', async () => {
    const confirmedOrder = {
      ...mockOrder,
      status: 'CONFIRMED',
    };

    prismaMock.order.findUnique.mockResolvedValue(confirmedOrder);

    const cancelledOrder = {
      ...confirmedOrder,
      status: 'CANCELLED',
    };

    prismaMock.order.update.mockResolvedValue(cancelledOrder);

    const result = await service.cancelOrder('order-001');

    expect(httpServiceMock.post).not.toHaveBeenCalled();

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'order-001' },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });

    expect(result).toEqual(cancelledOrder);
  });

  // UT-ORDER-13: Không thể hủy đơn đã CANCELLED
  it('UT-ORDER-13: should reject cancelling an already cancelled order', async () => {
    const cancelledOrder = {
      ...mockOrder,
      status: 'CANCELLED',
    };

    prismaMock.order.findUnique.mockResolvedValue(cancelledOrder);

    await expect(service.cancelOrder('order-001')).rejects.toThrow(
      BadRequestException,
    );

    expect(httpServiceMock.post).not.toHaveBeenCalled();
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });
});
