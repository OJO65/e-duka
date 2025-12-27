export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // Only stored in localStorage, not exposed
  orders?: Order[];
  wishlist?: string[]; // Array of product IDs
  createdAt?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  date: string;
  total: number;
  currency: string;
  status: OrderStatus;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}