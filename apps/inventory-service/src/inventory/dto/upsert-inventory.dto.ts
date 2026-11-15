import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpsertInventoryDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  warehouseLocation?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;
}