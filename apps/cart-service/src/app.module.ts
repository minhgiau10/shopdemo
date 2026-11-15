import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './prisma/prisma.service.js';
import { JwtStrategy } from './auth/jwt.strategy.js';
import { CartController } from './cart/cart.controller.js';
import { CartService } from './cart/cart.service.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PassportModule],
  controllers: [CartController],
  providers: [PrismaService, JwtStrategy, CartService],
})
export class AppModule {}