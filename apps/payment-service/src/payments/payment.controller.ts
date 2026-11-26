import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentService } from './payment.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createPayment(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(req.user.userId, dto);
  }

  @Get()
  getAllPayments() {
    return this.paymentService.getAllPayments();
  }

  @Get('order/:orderId')
  getByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrder(orderId);
  }

  @Get('vnpay-return')
  async vnpayReturn(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const rawTxnRef = query['vnp_TxnRef'] || '';
    const orderId = rawTxnRef.split('_')[0];
    const responseCode = query['vnp_ResponseCode'];

    if (responseCode === '00' && orderId) {
      await this.paymentService.handlePaymentSuccess(
        orderId,
        query['vnp_TransactionNo'],
      );
      return res.redirect(`${frontendUrl}/orders?payment=success`);
    }
    return res.redirect(`${frontendUrl}/orders?payment=failed`);
  }

  @Get('mock-success')
  async mockSuccess(
    @Query('orderId') orderId: string,
    @Query('txnRef') txnRef: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.paymentService.handlePaymentSuccess(orderId, txnRef);
    return res.redirect(`${frontendUrl}/orders?payment=success`);
  }
}
