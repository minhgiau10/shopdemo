import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [HttpModule],
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
})
export class PaymentModule {}