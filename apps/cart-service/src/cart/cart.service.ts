import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, items: [] },
      });
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      ...cart,
      totalItems,
      totalAmount,
    };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const cart = await this.getCart(userId);
    const items = [...cart.items];

    const existingIndex = items.findIndex((i) => i.productId === dto.productId);
    if (existingIndex > -1) {
      items[existingIndex].quantity += dto.quantity;
      items[existingIndex].price = dto.price;
      items[existingIndex].productName = dto.productName;
      if (dto.imageUrl !== undefined) {
        items[existingIndex].imageUrl = dto.imageUrl;
      }
    } else {
      items.push({
        productId: dto.productId,
        productName: dto.productName,
        price: dto.price,
        imageUrl: dto.imageUrl ?? null,
        quantity: dto.quantity,
      });
    }

    await this.prisma.cart.update({
      where: { userId },
      data: { items },
    });

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    const cart = await this.getCart(userId);
    const items = [...cart.items];

    const index = items.findIndex((i) => i.productId === productId);
    if (index === -1) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    items[index].quantity = quantity;

    await this.prisma.cart.update({
      where: { userId },
      data: { items },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getCart(userId);
    const items = cart.items.filter((i) => i.productId !== productId);

    await this.prisma.cart.update({
      where: { userId },
      data: { items },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.prisma.cart.upsert({
      where: { userId },
      update: { items: [] },
      create: { userId, items: [] },
    });

    return this.getCart(userId);
  }
}