import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  addItem(@Req() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Patch('items/:productId')
  updateItem(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(
      req.user.userId,
      productId,
      dto.quantity,
    );
  }

  @Delete('items/:productId')
  removeItem(@Req() req: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  @Delete()
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.userId);
  }
}