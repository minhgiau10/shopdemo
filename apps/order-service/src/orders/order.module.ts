import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [HttpModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
})
export class OrderModule {}