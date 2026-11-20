import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(1000)
  amount: number;

  @IsEnum(['COD', 'VNPAY', 'PAYPAL'])
  method: 'COD' | 'VNPAY' | 'PAYPAL';
}