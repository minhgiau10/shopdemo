import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PaymentModule } from './payment/payment.module.js';
import { JwtStrategy } from './auth/jwt.strategy.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PaymentModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}