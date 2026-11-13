import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto.js';

//chuyen do tat ca cac truong thanh khong bat buoc
export class UpdateProductDto extends PartialType(CreateProductDto) {}
