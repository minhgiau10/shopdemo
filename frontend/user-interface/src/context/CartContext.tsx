'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
}

export interface CartData {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface CartContextType {
  cart: CartData;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (item: {
    productId: string;
    productName: string;
    price: number;
    imageUrl?: string;
    quantity?: number;
  }) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartData>({ items: [], totalItems: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  };

  const refreshCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCart({
          items: data.items || [],
          totalItems: data.totalItems || 0,
          totalAmount: data.totalAmount || 0,
        });
      }
    } catch (error) {
      console.error('Lỗi tải giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (item: {
    productId: string;
    productName: string;
    price: number;
    imageUrl?: string;
    quantity?: number;
  }) => {
    const token = getToken();
    if (!token) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      router.push('/login');
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          imageUrl: item.imageUrl || undefined,
          quantity: item.quantity || 1,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!');
          router.push('/login');
        }
        return false;
      }

      const data = await res.json();
      setCart({
        items: data.items || [],
        totalItems: data.totalItems || 0,
        totalAmount: data.totalAmount || 0,
      });
      return true;
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      return false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const token = getToken();
    if (!token || quantity < 1) return;

    const res = await fetch(`${API_URL}/cart/items/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (res.ok) {
      const data = await res.json();
      setCart({
        items: data.items || [],
        totalItems: data.totalItems || 0,
        totalAmount: data.totalAmount || 0,
      });
    }
  };

  const removeItem = async (productId: string) => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_URL}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setCart({
        items: data.items || [],
        totalItems: data.totalItems || 0,
        totalAmount: data.totalAmount || 0,
      });
    }
  };

  const clearCart = async () => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được dùng bên trong CartProvider');
  return ctx;
}