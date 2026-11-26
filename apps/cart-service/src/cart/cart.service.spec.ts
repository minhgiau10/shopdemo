import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';

import { CartService } from './cart.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('CartService', () => {
  let cartService: CartService;

  // Mock Prisma methods
  const prismaMock = {
    cart: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
  };

  // Mock cart data
  const mockCart = {
    id: 'cart001',
    userId: 'user001',
    items: [
      {
        productId: 'product001',
        productName: 'iPhone 16',
        price: 20000000,
        quantity: 2,
        imageUrl: 'https://example.com/iphone16.jpg',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Initialize service before each test
  beforeEach(() => {
    vi.clearAllMocks();

    cartService = new CartService(prismaMock as unknown as PrismaService);
  });

  // ==========================================
  // TEST GET CART
  // ==========================================

  describe('getCart', () => {
    it('UT-CART-01: should return existing cart with calculated totals', async () => {
      // Arrange
      const userId = 'user001';

      prismaMock.cart.findUnique.mockResolvedValue(mockCart);

      // Act
      const result = await cartService.getCart(userId);

      // Assert
      expect(result.totalItems).toBe(2);
      expect(result.totalAmount).toBe(40000000);

      expect(result.items).toEqual(mockCart.items);

      expect(prismaMock.cart.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(prismaMock.cart.findUnique).toHaveBeenCalledOnce();
    });

    it('UT-CART-02: should create a new cart when cart does not exist', async () => {
      // Arrange
      const userId = 'user002';

      const newCart = {
        ...mockCart,
        userId,
        items: [],
      };

      prismaMock.cart.findUnique.mockResolvedValue(null);
      prismaMock.cart.create.mockResolvedValue(newCart);

      // Act
      const result = await cartService.getCart(userId);

      // Assert
      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalAmount).toBe(0);

      expect(prismaMock.cart.create).toHaveBeenCalledWith({
        data: {
          userId,
          items: [],
        },
      });

      expect(prismaMock.cart.create).toHaveBeenCalledOnce();
    });
  });

  // ==========================================
  // TEST ADD ITEM
  // ==========================================

  describe('addItem', () => {
    it('UT-CART-03: should add a new product to cart successfully', async () => {
      // Arrange
      const userId = 'user001';

      const addToCartDto = {
        productId: 'product002',
        productName: 'iPad Air',
        price: 15000000,
        quantity: 1,
        imageUrl: 'https://example.com/ipad.jpg',
      };

      const updatedCart = {
        ...mockCart,
        items: [...mockCart.items, addToCartDto],
      };

      prismaMock.cart.findUnique
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(updatedCart);

      prismaMock.cart.update.mockResolvedValue(updatedCart);

      // Act
      const result = await cartService.addItem(userId, addToCartDto);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.totalItems).toBe(3);
      expect(result.totalAmount).toBe(55000000);

      expect(prismaMock.cart.update).toHaveBeenCalledWith({
        where: { userId },
        data: { items: updatedCart.items },
      });

      expect(prismaMock.cart.update).toHaveBeenCalledOnce();
    });

    it('UT-CART-04: should increase quantity when product already exists in cart', async () => {
      // Arrange
      const userId = 'user001';

      const addToCartDto = {
        productId: 'product001',
        productName: 'iPhone 16',
        price: 20000000,
        quantity: 3,
        imageUrl: 'https://example.com/iphone16.jpg',
      };

      const updatedItems = [
        {
          ...mockCart.items[0],
          quantity: 5,
        },
      ];

      const updatedCart = {
        ...mockCart,
        items: updatedItems,
      };

      prismaMock.cart.findUnique
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(updatedCart);

      prismaMock.cart.update.mockResolvedValue(updatedCart);

      // Act
      const result = await cartService.addItem(userId, addToCartDto);

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(5);
      expect(result.totalItems).toBe(5);
      expect(result.totalAmount).toBe(100000000);

      expect(prismaMock.cart.update).toHaveBeenCalledOnce();
    });
  });

  // ==========================================
  // TEST UPDATE ITEM QUANTITY
  // ==========================================

  describe('updateItemQuantity', () => {
    it('UT-CART-05: should update product quantity successfully', async () => {
      // Arrange
      const userId = 'user001';
      const productId = 'product001';
      const quantity = 5;

      const updatedItems = [
        {
          ...mockCart.items[0],
          quantity,
        },
      ];

      const updatedCart = {
        ...mockCart,
        items: updatedItems,
      };

      prismaMock.cart.findUnique
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(updatedCart);

      prismaMock.cart.update.mockResolvedValue(updatedCart);

      // Act
      const result = await cartService.updateItemQuantity(
        userId,
        productId,
        quantity,
      );

      // Assert
      expect(result.items[0].quantity).toBe(5);
      expect(result.totalItems).toBe(5);
      expect(result.totalAmount).toBe(100000000);

      expect(prismaMock.cart.update).toHaveBeenCalledWith({
        where: { userId },
        data: { items: updatedItems },
      });

      expect(prismaMock.cart.update).toHaveBeenCalledOnce();
    });

    it('UT-CART-06: should throw NotFoundException when product is not in cart', async () => {
      // Arrange
      const userId = 'user001';
      const productId = 'invalid-product';

      prismaMock.cart.findUnique.mockResolvedValue(mockCart);

      // Act and Assert
      await expect(
        cartService.updateItemQuantity(userId, productId, 5),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaMock.cart.update).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // TEST REMOVE ITEM
  // ==========================================

  describe('removeItem', () => {
    it('UT-CART-07: should remove product from cart successfully', async () => {
      // Arrange
      const userId = 'user001';
      const productId = 'product001';

      const updatedCart = {
        ...mockCart,
        items: [],
      };

      prismaMock.cart.findUnique
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(updatedCart);

      prismaMock.cart.update.mockResolvedValue(updatedCart);

      // Act
      const result = await cartService.removeItem(userId, productId);

      // Assert
      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalAmount).toBe(0);

      expect(prismaMock.cart.update).toHaveBeenCalledWith({
        where: { userId },
        data: { items: [] },
      });

      expect(prismaMock.cart.update).toHaveBeenCalledOnce();
    });
  });

  // ==========================================
  // TEST CLEAR CART
  // ==========================================

  describe('clearCart', () => {
    it('UT-CART-08: should clear all products from cart successfully', async () => {
      // Arrange
      const userId = 'user001';

      const emptyCart = {
        ...mockCart,
        items: [],
      };

      prismaMock.cart.upsert.mockResolvedValue(emptyCart);
      prismaMock.cart.findUnique.mockResolvedValue(emptyCart);

      // Act
      const result = await cartService.clearCart(userId);

      // Assert
      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalAmount).toBe(0);

      expect(prismaMock.cart.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: { items: [] },
        create: {
          userId,
          items: [],
        },
      });

      expect(prismaMock.cart.upsert).toHaveBeenCalledOnce();
    });
  });
});
