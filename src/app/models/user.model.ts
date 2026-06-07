export interface User {
  id:          string;
  username:    string;
  email:       string;
  phone?:      string;
  avatar_url?: string;
  orders?:     Order[];
  wishlist?:   string[];
  createdAt?:  string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id:       string;
  date:     string;
  total:    number;
  currency: string;
  status:   OrderStatus;
  items:    OrderItem[];
}

export interface OrderItem {
  productId: string;
  title:     string;
  image:     string;
  price:     number;
  quantity:  number;
}