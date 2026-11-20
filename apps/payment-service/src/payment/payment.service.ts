import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const existing = await this.prisma.payment.findUnique({
      where: { orderId: dto.orderId },
    });
    if (existing && existing.status === 'SUCCESS') {
      throw new BadRequestException('Đơn hàng này đã được thanh toán');
    }

    let paymentUrl: string | null = null;
    const txnRef = `TXN_${Date.now()}`;

    if (dto.method === 'VNPAY') {
      paymentUrl = this.buildVnpayUrl(dto.orderId, dto.amount, txnRef);
    } else if (dto.method === 'PAYPAL') {
      const gatewayUrl = 'http://localhost:8080';
      paymentUrl = `${gatewayUrl}/payments/mock-success?orderId=${dto.orderId}&txnRef=${txnRef}`;
    }

    const payment = existing
      ? await this.prisma.payment.update({
          where: { orderId: dto.orderId },
          data: {
            amount: dto.amount,
            method: dto.method,
            transactionId: txnRef,
            paymentUrl,
            status: 'PENDING',
          },
        })
      : await this.prisma.payment.create({
          data: {
            orderId: dto.orderId,
            userId,
            amount: dto.amount,
            method: dto.method,
            transactionId: txnRef,
            paymentUrl,
            status: 'PENDING',
          },
        });

    return payment;
  }

  private buildVnpayUrl(orderId: string, amount: number, txnRef: string): string {
    const tmnCode = this.configService.get<string>('VNP_TMN_CODE') || 'DEMOV210';
    const secretKey = this.configService.get<string>('VNP_HASH_SECRET') || 'SECRETKEY1234567890';
    const vnpUrl =
      this.configService.get<string>('VNP_URL') ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl =
      this.configService.get<string>('VNP_RETURN_URL') ||
      'http://localhost:8080/payments/vnpay-return';

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: `${orderId}_${txnRef}`,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: String(Math.round(amount * 100)),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(vnpParams[key]).replace(/%20/g, '+')}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
  }

  async handlePaymentSuccess(orderId: string, transactionId?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch thanh toán');

    if (payment.status !== 'SUCCESS') {
      await this.prisma.payment.update({
        where: { orderId },
        data: {
          status: 'SUCCESS',
          transactionId: transactionId || payment.transactionId,
        },
      });

      const orderServiceUrl =
        this.configService.get<string>('ORDER_SERVICE_URL') || 'http://localhost:3005';
      await firstValueFrom(
        this.httpService.post(`${orderServiceUrl}/orders/${orderId}/confirm`),
      );
    }

    return this.prisma.payment.findUnique({ where: { orderId } });
  }

  async getPaymentByOrder(orderId: string) {
    return this.prisma.payment.findUnique({ where: { orderId } });
  }

  async getAllPayments() {
    return this.prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
  }
}