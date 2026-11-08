export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  brand: string;
  category: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};