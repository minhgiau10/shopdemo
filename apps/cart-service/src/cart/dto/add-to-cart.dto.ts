import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}