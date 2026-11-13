import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
