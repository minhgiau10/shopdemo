import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto.js';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('import')
  importStock(@Body() dto: UpsertInventoryDto) {
    return this.inventoryService.importStock(dto);
  }

  // Các API nội bộ cho Order Service gọi đồng bộ kho
  @Post('reserve')
  reserveStock(@Body() dto: ReserveInventoryDto) {
    return this.inventoryService.reserveStock(dto);
  }

  @Post('confirm/:orderId')
  confirmStock(@Param('orderId') orderId: string) {
    return this.inventoryService.confirmStock(orderId);
  }

  @Post('release/:orderId')
  releaseStock(@Param('orderId') orderId: string) {
    return this.inventoryService.releaseStock(orderId);
  }
}