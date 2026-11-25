import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { create } from 'domain';

describe('AuthService', () => {
  let authService: AuthService;

  const prismaMock = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  const jwtMock = {
    signAsync: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    authService = new AuthService(
      prismaMock as unknown as PrismaService,
      jwtMock as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('UT-AUTH-01: should register a new user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      prismaMock.user.create.mockImplementation(async ({ data }) => ({
        id: 'user001',
        email: data.email,
        fullName: data.fullName,
        role: 'CUSTOMER',
        createdAt: new Date(),
      }));

      const result = await authService.register({
        email: 'test@example.com',
        password: '123456',
        fullName: 'Test User',
      });

      expect(result.message).toBe('Registration successful');
      expect(result.user.email).toBe('test@example.com');
    });

    it('UT-AUTH-02: should reject an existing email', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user001',
        email: 'test@example.com',
      });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: '123456',
          fullName: 'Test User',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('UT-AUTH-03: should hash password before saving', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await authService.register({
        email: 'new@example.com',
        password: '123456',
        fullName: 'New User',
      });

      const createCall = prismaMock.user.create.mock.calls[0][0];

      expect(createCall.data.passwordHash).not.toBe('123456');

      const isPasswordCorrect = await bcrypt.compare(
        '123456',
        createCall.data.passwordHash,
      );

      expect(isPasswordCorrect).toBe(true);
    });
  });

  describe('login', () => {
    it('UT-AUTH-04: should login successfully with correct credentials', async () => {
      const passwordHash = await bcrypt.hash('123456', 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user001',
        email: 'test@example.com',
        passwordHash,
        role: 'CUSTOMER',
        isActive: true,
      });

      jwtMock.signAsync.mockResolvedValue('mock-access-token');

      const result = await authService.login({
        email: 'test@example.com',
        password: '123456',
      });
      console.log(result);

      expect(result.message).toBe('Login successful');
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user.email).toBe('test@example.com');

      expect(jwtMock.signAsync).toHaveBeenCalledOnce();
    });

    it('UT-AUTH-05: should reject an unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: '123456',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('UT-AUTH-06: should reject an inactive account', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user001',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        isActive: false,
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: '123456',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('UT-AUTH-07: should reject an incorrect password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user001',
        email: 'test@example.com',
        passwordHash,
        isActive: true,
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });
});
