import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';

import { ProductsService } from './products.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ProductsService', () => {
  let productsService: ProductsService;

  // Mock Prisma methods
  const prismaMock = {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  // Mock product data
  const mockProduct = {
    id: 'product001',
    name: 'iPhone 16',
    description: 'Apple smartphone',
    price: 20000000,
    brand: 'Apple',
    category: 'Smartphone',
    imageUrl: 'https://example.com/iphone16.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Product creation data
  const createProductDto = {
    name: 'iPhone 16',
    description: 'Apple smartphone',
    price: 20000000,
    brand: 'Apple',
    category: 'Smartphone',
    imageUrl: 'https://example.com/iphone16.jpg',
  };

  // Initialize service before each test
  beforeEach(() => {
    vi.clearAllMocks();

    productsService = new ProductsService(
      prismaMock as unknown as PrismaService,
    );
  });

  // ==========================================
  // TEST FIND ALL PRODUCTS
  // ==========================================

  describe('findAll', () => {
    it('UT-PROD-01: should return all active products', async () => {
      // Arrange
      const expectedProducts = [mockProduct];

      prismaMock.product.findMany.mockResolvedValue(expectedProducts);

      // Act
      const result = await productsService.findAll();

      // Assert
      expect(result).toEqual(expectedProducts);

      expect(prismaMock.product.findMany).toHaveBeenCalledOnce();
    });

    it('UT-PROD-02: should filter active products and sort by createdAt descending', async () => {
      // Arrange
      prismaMock.product.findMany.mockResolvedValue([mockProduct]);

      // Act
      await productsService.findAll();

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  // ==========================================
  // TEST CREATE PRODUCT
  // ==========================================

  describe('create', () => {
    it('UT-PROD-03: should create a new product successfully', async () => {
      // Arrange
      const expectedProduct = mockProduct;

      prismaMock.product.create.mockResolvedValue(expectedProduct);

      // Act
      const result = await productsService.create(createProductDto);

      // Assert
      expect(result).toEqual(expectedProduct);

      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: createProductDto,
      });

      expect(prismaMock.product.create).toHaveBeenCalledOnce();
    });
  });

  // ==========================================
  // TEST FIND PRODUCT BY ID
  // ==========================================

  describe('findOne', () => {
    it('UT-PROD-04: should return a product when it exists', async () => {
      // Arrange
      const productId = 'product001';

      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      // Act
      const result = await productsService.findOne(productId);

      // Assert
      expect(result).toEqual(mockProduct);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: {
          id: productId,
        },
      });

      expect(prismaMock.product.findUnique).toHaveBeenCalledOnce();
    });

    it('UT-PROD-05: should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const productId = 'invalid-id';

      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act and Assert
      await expect(productsService.findOne(productId)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: {
          id: productId,
        },
      });
    });
  });

  // ==========================================
  // TEST UPDATE PRODUCT
  // ==========================================

  describe('update', () => {
    it('UT-PROD-06: should update a product successfully', async () => {
      // Arrange
      const productId = 'product001';

      const updateProductDto = {
        price: 18000000,
      };

      const updatedProduct = {
        ...mockProduct,
        price: 18000000,
      };

      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      prismaMock.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await productsService.update(productId, updateProductDto);

      // Assert
      expect(result).toEqual(updatedProduct);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: {
          id: productId,
        },
      });

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: {
          id: productId,
        },
        data: updateProductDto,
      });

      expect(prismaMock.product.update).toHaveBeenCalledOnce();
    });
  });

  // ==========================================
  // TEST REMOVE PRODUCT
  // ==========================================

  describe('remove', () => {
    it('UT-PROD-07: should soft delete a product successfully', async () => {
      // Arrange
      const productId = 'product001';

      const deletedProduct = {
        ...mockProduct,
        isActive: false,
      };

      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      prismaMock.product.update.mockResolvedValue(deletedProduct);

      // Act
      const result = await productsService.remove(productId);
      console.log(result);

      // Assert
      expect(result).toEqual(deletedProduct);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: {
          id: productId,
        },
      });

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: {
          id: productId,
        },
        data: {
          isActive: false,
        },
      });

      expect(prismaMock.product.update).toHaveBeenCalledOnce();
    });
  });
});
