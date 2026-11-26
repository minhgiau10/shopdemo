import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { PaymentService } from './payment.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

describe('PaymentService', () => {
  let service: PaymentService;

  // Mock Prisma
  const prismaMock = {
    payment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
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

  const createPaymentDto: CreatePaymentDto = {
    orderId: 'order-001',
    amount: 25000000,
    method: 'COD',
  };

  const mockPayment = {
    id: 'payment-001',
    orderId: 'order-001',
    userId: 'user-001',
    amount: 25000000,
    method: 'COD',
    transactionId: 'TXN_123456',
    paymentUrl: null,
    status: 'PENDING',
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    configServiceMock.get.mockReturnValue(undefined);

    service = new PaymentService(
      prismaMock as unknown as PrismaService,
      httpServiceMock as unknown as HttpService,
      configServiceMock as unknown as ConfigService,
    );
  });

  // UT-PAY-01: Tạo thanh toán COD
  it('UT-PAY-01: should create COD payment successfully', async () => {
    prismaMock.payment.findUnique.mockResolvedValue(null);
    prismaMock.payment.create.mockResolvedValue(mockPayment);

    const result = await service.createPayment('user-001', createPaymentDto);

    expect(result).toEqual(mockPayment);

    expect(prismaMock.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-001',
        userId: 'user-001',
        amount: 25000000,
        method: 'COD',
        status: 'PENDING',
        paymentUrl: null,
      }),
    });
  });

  // UT-PAY-02: Tạo thanh toán VNPAY
  it('UT-PAY-02: should create VNPAY payment with signed URL', async () => {
    const vnpayDto: CreatePaymentDto = {
      ...createPaymentDto,
      method: 'VNPAY',
    };

    prismaMock.payment.findUnique.mockResolvedValue(null);

    prismaMock.payment.create.mockImplementation(async ({ data }) => ({
      ...mockPayment,
      ...data,
    }));

    const result = await service.createPayment('user-001', vnpayDto);

    expect(result.method).toBe('VNPAY');
    expect(result.paymentUrl).toContain(
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?',
    );
    expect(result.paymentUrl).toContain('vnp_SecureHash=');
    expect(result.paymentUrl).toContain('vnp_Amount=2500000000');

    expect(prismaMock.payment.create).toHaveBeenCalled();
  });

  // UT-PAY-03: Tạo thanh toán PAYPAL
  it('UT-PAY-03: should create PAYPAL payment with mock success URL', async () => {
    const paypalDto: CreatePaymentDto = {
      ...createPaymentDto,
      method: 'PAYPAL',
    };

    prismaMock.payment.findUnique.mockResolvedValue(null);

    prismaMock.payment.create.mockImplementation(async ({ data }) => ({
      ...mockPayment,
      ...data,
    }));

    const result = await service.createPayment('user-001', paypalDto);

    expect(result.method).toBe('PAYPAL');
    expect(result.paymentUrl).toContain(
      'http://localhost:8080/payments/mock-success?orderId=order-001',
    );
    expect(result.paymentUrl).toContain('txnRef=TXN_');
  });

  // UT-PAY-04: Cập nhật giao dịch đã tồn tại nhưng chưa SUCCESS
  it('UT-PAY-04: should update existing payment instead of creating new one', async () => {
    const existingPayment = {
      ...mockPayment,
      status: 'PENDING',
    };

    const updatedPayment = {
      ...existingPayment,
      amount: 30000000,
      method: 'COD',
      status: 'PENDING',
    };

    prismaMock.payment.findUnique.mockResolvedValue(existingPayment);
    prismaMock.payment.update.mockResolvedValue(updatedPayment);

    const updatedDto: CreatePaymentDto = {
      ...createPaymentDto,
      amount: 30000000,
    };

    const result = await service.createPayment('user-001', updatedDto);

    expect(result).toEqual(updatedPayment);

    expect(prismaMock.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderId: 'order-001' },
        data: expect.objectContaining({
          amount: 30000000,
          status: 'PENDING',
        }),
      }),
    );

    expect(prismaMock.payment.create).not.toHaveBeenCalled();
  });

  // UT-PAY-05: Không cho thanh toán lại đơn hàng SUCCESS
  it('UT-PAY-05: should reject payment when order is already paid', async () => {
    const successfulPayment = {
      ...mockPayment,
      status: 'SUCCESS',
    };

    prismaMock.payment.findUnique.mockResolvedValue(successfulPayment);

    await expect(
      service.createPayment('user-001', createPaymentDto),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.payment.create).not.toHaveBeenCalled();
    expect(prismaMock.payment.update).not.toHaveBeenCalled();
  });

  // UT-PAY-06: Xử lý thanh toán thành công
  it('UT-PAY-06: should mark payment as SUCCESS and confirm order', async () => {
    prismaMock.payment.findUnique
      .mockResolvedValueOnce(mockPayment)
      .mockResolvedValueOnce({
        ...mockPayment,
        status: 'SUCCESS',
        transactionId: 'VNPAY-123',
      });

    prismaMock.payment.update.mockResolvedValue({
      ...mockPayment,
      status: 'SUCCESS',
      transactionId: 'VNPAY-123',
    });

    httpServiceMock.post.mockReturnValue(of({ data: {} }));

    const result = await service.handlePaymentSuccess('order-001', 'VNPAY-123');

    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { orderId: 'order-001' },
      data: {
        status: 'SUCCESS',
        transactionId: 'VNPAY-123',
      },
    });

    expect(httpServiceMock.post).toHaveBeenCalledWith(
      'http://localhost:3005/orders/order-001/confirm',
    );

    expect(result.status).toBe('SUCCESS');
    expect(result.transactionId).toBe('VNPAY-123');
  });

  // UT-PAY-07: Không xử lý lại giao dịch SUCCESS
  it('UT-PAY-07: should not update or confirm order again when payment is already SUCCESS', async () => {
    const successfulPayment = {
      ...mockPayment,
      status: 'SUCCESS',
    };

    prismaMock.payment.findUnique.mockResolvedValue(successfulPayment);

    const result = await service.handlePaymentSuccess('order-001');

    expect(prismaMock.payment.update).not.toHaveBeenCalled();
    expect(httpServiceMock.post).not.toHaveBeenCalled();

    expect(result).toEqual(successfulPayment);
  });

  // UT-PAY-08: Không tìm thấy giao dịch
  it('UT-PAY-08: should throw NotFoundException when payment does not exist', async () => {
    prismaMock.payment.findUnique.mockResolvedValue(null);

    await expect(service.handlePaymentSuccess('order-999')).rejects.toThrow(
      NotFoundException,
    );

    expect(prismaMock.payment.update).not.toHaveBeenCalled();
    expect(httpServiceMock.post).not.toHaveBeenCalled();
  });

  // UT-PAY-09: Lấy giao dịch theo orderId
  it('UT-PAY-09: should return payment by orderId', async () => {
    prismaMock.payment.findUnique.mockResolvedValue(mockPayment);

    const result = await service.getPaymentByOrder('order-001');

    expect(result).toEqual(mockPayment);

    expect(prismaMock.payment.findUnique).toHaveBeenCalledWith({
      where: { orderId: 'order-001' },
    });
  });

  // UT-PAY-10: Lấy tất cả giao dịch
  it('UT-PAY-10: should return all payments sorted by createdAt descending', async () => {
    prismaMock.payment.findMany.mockResolvedValue([mockPayment]);

    const result = await service.getAllPayments();

    expect(result).toEqual([mockPayment]);

    expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });

  // UT-PAY-11: Order Service gặp lỗi khi xác nhận đơn
  it('UT-PAY-11: should propagate error when Order Service confirmation fails', async () => {
    prismaMock.payment.findUnique.mockResolvedValue(mockPayment);

    prismaMock.payment.update.mockResolvedValue({
      ...mockPayment,
      status: 'SUCCESS',
    });

    httpServiceMock.post.mockReturnValue(
      throwError(() => new Error('Order Service unavailable')),
    );

    await expect(service.handlePaymentSuccess('order-001')).rejects.toThrow(
      'Order Service unavailable',
    );

    expect(prismaMock.payment.update).toHaveBeenCalled();
    expect(httpServiceMock.post).toHaveBeenCalled();
  });

  // UT-PAY-12: Giữ transactionId cũ nếu không truyền transactionId mới
  it('UT-PAY-12: should keep existing transactionId when no new transactionId is provided', async () => {
    prismaMock.payment.findUnique
      .mockResolvedValueOnce(mockPayment)
      .mockResolvedValueOnce({
        ...mockPayment,
        status: 'SUCCESS',
      });

    prismaMock.payment.update.mockResolvedValue({
      ...mockPayment,
      status: 'SUCCESS',
    });

    httpServiceMock.post.mockReturnValue(of({ data: {} }));

    await service.handlePaymentSuccess('order-001');

    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { orderId: 'order-001' },
      data: {
        status: 'SUCCESS',
        transactionId: 'TXN_123456',
      },
    });
  });
});
