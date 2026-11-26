import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { InventoryService } from './inventory.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('InventoryService', () => {
  const prismaMock = {
    inventory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    inventoryReservation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  let inventoryService: InventoryService;

  const mockStock = {
    id: 'stock001',
    productId: 'product001',
    sku: 'IP16-001',
    warehouseLocation: 'Kho chính HCM',
    availableQuantity: 20,
    reservedQuantity: 0,
    lowStockThreshold: 5,
  };

  const mockReservation = {
    id: 'reservation001',
    orderId: 'order001',
    items: [
      {
        productId: 'product001',
        quantity: 2,
      },
    ],
    status: 'RESERVED',
    expiresAt: new Date('2026-12-01T10:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    inventoryService = new InventoryService(
      prismaMock as unknown as PrismaService,
    );
  });

  // =========================
  // findAll
  // =========================

  describe('findAll', () => {
    it('UT-INV-01: should return all stocks with low stock status', async () => {
      // Arrange
      const mockStocks = [
        {
          ...mockStock,
          availableQuantity: 3,
          lowStockThreshold: 5,
        },
        {
          ...mockStock,
          id: 'stock002',
          productId: 'product002',
          availableQuantity: 20,
          lowStockThreshold: 5,
        },
      ];

      prismaMock.inventory.findMany.mockResolvedValue(mockStocks);

      // Act
      const result = await inventoryService.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].isLowStock).toBe(true);
      expect(result[1].isLowStock).toBe(false);
      expect(prismaMock.inventory.findMany).toHaveBeenCalledOnce();
    });
  });

  // =========================
  // findByProductId
  // =========================

  describe('findByProductId', () => {
    it('UT-INV-02: should return stock by product ID', async () => {
      // Arrange
      prismaMock.inventory.findUnique.mockResolvedValue(mockStock);

      // Act
      const result = await inventoryService.findByProductId('product001');

      // Assert
      expect(result.productId).toBe('product001');
      expect(result.isLowStock).toBe(false);

      expect(prismaMock.inventory.findUnique).toHaveBeenCalledWith({
        where: { productId: 'product001' },
      });
    });

    it('UT-INV-03: should throw NotFoundException when stock does not exist', async () => {
      // Arrange
      prismaMock.inventory.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        inventoryService.findByProductId('product999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =========================
  // importStock
  // =========================

  describe('importStock', () => {
    it('UT-INV-04: should increase available quantity when stock already exists', async () => {
      // Arrange
      const importDto = {
        productId: 'product001',
        quantity: 10,
        sku: 'IP16-001',
      };

      prismaMock.inventory.upsert.mockResolvedValue({
        ...mockStock,
        availableQuantity: 30,
      });

      // Act
      const result = await inventoryService.importStock(importDto);

      // Assert
      expect(result.availableQuantity).toBe(30);

      expect(prismaMock.inventory.upsert).toHaveBeenCalledWith({
        where: { productId: 'product001' },
        update: {
          availableQuantity: { increment: 10 },
          sku: 'IP16-001',
        },
        create: {
          productId: 'product001',
          sku: 'IP16-001',
          warehouseLocation: 'Kho chính HCM',
          availableQuantity: 10,
          reservedQuantity: 0,
          lowStockThreshold: 5,
        },
      });
    });

    it('UT-INV-05: should create stock when product has no inventory record', async () => {
      // Arrange
      const importDto = {
        productId: 'product002',
        quantity: 15,
        sku: 'IPAD-001',
      };

      const newStock = {
        id: 'stock002',
        ...importDto,
        warehouseLocation: 'Kho chính HCM',
        availableQuantity: 15,
        reservedQuantity: 0,
        lowStockThreshold: 5,
      };

      prismaMock.inventory.upsert.mockResolvedValue(newStock);

      // Act
      const result = await inventoryService.importStock(importDto);

      // Assert
      expect(result.productId).toBe('product002');
      expect(result.availableQuantity).toBe(15);
      expect(result.reservedQuantity).toBe(0);

      expect(prismaMock.inventory.upsert).toHaveBeenCalledOnce();
    });
  });

  // =========================
  // reserveStock
  // =========================

  describe('reserveStock', () => {
    it('UT-INV-06: should reserve stock successfully', async () => {
      // Arrange
      const reserveDto = {
        orderId: 'order001',
        items: [
          {
            productId: 'product001',
            quantity: 2,
          },
        ],
      };

      prismaMock.inventoryReservation.findUnique.mockResolvedValue(null);

      prismaMock.inventory.updateMany.mockResolvedValue({
        count: 1,
      });

      prismaMock.inventoryReservation.create.mockResolvedValue(mockReservation);

      // Act
      const result = await inventoryService.reserveStock(reserveDto);

      // Assert
      expect(result.message).toBe('Giữ kho thành công');
      expect(result.reservation).toEqual(mockReservation);

      expect(prismaMock.inventory.updateMany).toHaveBeenCalledWith({
        where: {
          productId: 'product001',
          availableQuantity: { gte: 2 },
        },
        data: {
          availableQuantity: { decrement: 2 },
          reservedQuantity: { increment: 2 },
        },
      });

      expect(prismaMock.inventoryReservation.create).toHaveBeenCalledOnce();
    });

    it('UT-INV-07: should return existing reservation when order was already reserved', async () => {
      // Arrange
      prismaMock.inventoryReservation.findUnique.mockResolvedValue(
        mockReservation,
      );

      const reserveDto = {
        orderId: 'order001',
        items: [
          {
            productId: 'product001',
            quantity: 2,
          },
        ],
      };

      // Act
      const result = await inventoryService.reserveStock(reserveDto);

      // Assert
      expect(result.message).toBe('Đơn hàng đã được giữ kho trước đó');
      expect(result.reservation).toEqual(mockReservation);

      expect(prismaMock.inventory.updateMany).not.toHaveBeenCalled();
      expect(prismaMock.inventoryReservation.create).not.toHaveBeenCalled();
    });

    it('UT-INV-08: should throw BadRequestException when stock is insufficient', async () => {
      // Arrange
      const reserveDto = {
        orderId: 'order002',
        items: [
          {
            productId: 'product001',
            quantity: 100,
          },
        ],
      };

      prismaMock.inventoryReservation.findUnique.mockResolvedValue(null);
      prismaMock.inventory.updateMany.mockResolvedValue({
        count: 0,
      });

      // Act & Assert
      await expect(inventoryService.reserveStock(reserveDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaMock.inventoryReservation.create).not.toHaveBeenCalled();
    });

    it('UT-INV-09: should rollback previously reserved items when a later item fails', async () => {
      // Arrange
      const reserveDto = {
        orderId: 'order003',
        items: [
          {
            productId: 'product001',
            quantity: 2,
          },
          {
            productId: 'product002',
            quantity: 100,
          },
        ],
      };

      prismaMock.inventoryReservation.findUnique.mockResolvedValue(null);

      prismaMock.inventory.updateMany
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 1 });

      // Act & Assert
      await expect(inventoryService.reserveStock(reserveDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaMock.inventory.updateMany).toHaveBeenCalledTimes(3);

      expect(prismaMock.inventory.updateMany).toHaveBeenNthCalledWith(3, {
        where: { productId: 'product001' },
        data: {
          availableQuantity: { increment: 2 },
          reservedQuantity: { decrement: 2 },
        },
      });

      expect(prismaMock.inventoryReservation.create).not.toHaveBeenCalled();
    });
  });

  // =========================
  // confirmStock
  // =========================

  describe('confirmStock', () => {
    it('UT-INV-10: should confirm stock successfully', async () => {
      // Arrange
      prismaMock.inventoryReservation.findUnique.mockResolvedValue(
        mockReservation,
      );

      prismaMock.inventory.updateMany.mockResolvedValue({
        count: 1,
      });

      prismaMock.inventoryReservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'CONFIRMED',
      });

      // Act
      const result = await inventoryService.confirmStock('order001');

      // Assert
      expect(result.message).toBe('Xác nhận trừ kho thành công');
      expect(result.orderId).toBe('order001');

      expect(prismaMock.inventory.updateMany).toHaveBeenCalledWith({
        where: { productId: 'product001' },
        data: {
          reservedQuantity: { decrement: 2 },
        },
      });

      expect(prismaMock.inventoryReservation.update).toHaveBeenCalledWith({
        where: { orderId: 'order001' },
        data: { status: 'CONFIRMED' },
      });
    });

    it('UT-INV-11: should throw NotFoundException when reservation does not exist', async () => {
      // Arrange
      prismaMock.inventoryReservation.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(inventoryService.confirmStock('order999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('UT-INV-12: should return message when reservation is already confirmed', async () => {
      // Arrange
      prismaMock.inventoryReservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'CONFIRMED',
      });

      // Act
      const result = await inventoryService.confirmStock('order001');

      // Assert
      expect(result.message).toBe('Đơn hàng đã được xuất kho trước đó');
      expect(prismaMock.inventory.updateMany).not.toHaveBeenCalled();
      expect(prismaMock.inventoryReservation.update).not.toHaveBeenCalled();
    });
  });

  // =========================
  // releaseStock
  // =========================

  describe('releaseStock', () => {
    it('UT-INV-13: should release reserved stock successfully', async () => {
      // Arrange
      prismaMock.inventoryReservation.findUnique.mockResolvedValue(
        mockReservation,
      );

      prismaMock.inventory.updateMany.mockResolvedValue({
        count: 1,
      });

      prismaMock.inventoryReservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'RELEASED',
      });

      // Act
      const result = await inventoryService.releaseStock('order001');

      // Assert
      expect(result.message).toBe('Nhả kho thành công');
      expect(result.orderId).toBe('order001');

      expect(prismaMock.inventory.updateMany).toHaveBeenCalledWith({
        where: { productId: 'product001' },
        data: {
          availableQuantity: { increment: 2 },
          reservedQuantity: { decrement: 2 },
        },
      });

      expect(prismaMock.inventoryReservation.update).toHaveBeenCalledWith({
        where: { orderId: 'order001' },
        data: { status: 'RELEASED' },
      });
    });

    it('UT-INV-14: should not release stock when reservation is not RESERVED', async () => {
      // Arrange
      prismaMock.inventoryReservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'CONFIRMED',
      });

      // Act
      const result = await inventoryService.releaseStock('order001');

      // Assert
      expect(result.message).toBe(
        'Trạng thái phiếu đang là CONFIRMED, không thể nhả kho',
      );

      expect(prismaMock.inventory.updateMany).not.toHaveBeenCalled();
      expect(prismaMock.inventoryReservation.update).not.toHaveBeenCalled();
    });
  });
});
