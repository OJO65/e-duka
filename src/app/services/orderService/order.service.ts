import { Injectable } from '@angular/core';
import { Cart } from '../../models/cart.model';
import { Order, OrderItem, OrderStatus } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly USERS_KEY = 'eduka_users';

  constructor() {}

  /**
   * Create a new order from cart items
   */
  createOrder(cart: Cart, userId: number): Order {
    // Generate unique order ID
    const orderId = this.generateOrderId();

    // Convert cart items to order items
    const orderItems: OrderItem[] = cart.items.map(item => ({
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity
    }));

    // Create order object
    const order: Order = {
      id: orderId,
      date: new Date().toISOString(),
      total: cart.subtotal,
      currency: cart.currency,
      status: 'pending',
      items: orderItems
    };

    // Save order to user's orders array
    this.saveOrderToUser(userId, order);

    return order;
  }

  /**
   * Get all orders for a specific user
   */
  getOrdersByUserId(userId: number): Order[] {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user || !user.orders) {
      return [];
    }

    // Sort by date (newest first)
    return user.orders.sort((a: Order, b: Order) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Get a specific order by ID
   */
  getOrderById(orderId: string, userId: number): Order | null {
    const orders = this.getOrdersByUserId(userId);
    return orders.find(order => order.id === orderId) || null;
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, userId: number, newStatus: OrderStatus): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1 || !users[userIndex].orders) {
      return false;
    }

    const orderIndex = users[userIndex].orders!.findIndex((o: Order) => o.id === orderId);

    if (orderIndex === -1) {
      return false;
    }

    // Update status
    users[userIndex].orders![orderIndex].status = newStatus;

    // Save back to localStorage
    this.saveUsers(users);

    return true;
  }

  /**
   * Get order count for a user
   */
  getOrderCount(userId: number): number {
    return this.getOrdersByUserId(userId).length;
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(userId: number, status: OrderStatus): Order[] {
    const orders = this.getOrdersByUserId(userId);
    return orders.filter(order => order.status === status);
  }

  /**
   * Calculate total spent by user
   */
  getTotalSpent(userId: number): number {
    const orders = this.getOrdersByUserId(userId);
    return orders.reduce((total, order) => total + order.total, 0);
  }

  // Private helper methods

  private saveOrderToUser(userId: number, order: Order): void {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      console.error('User not found');
      return;
    }

    // Initialize orders array if it doesn't exist
    if (!users[userIndex].orders) {
      users[userIndex].orders = [];
    }

    // Add order to user's orders
    users[userIndex].orders!.push(order);

    // Save back to localStorage
    this.saveUsers(users);
  }

  private generateOrderId(): string {
    // Generate order ID: ORD-timestamp-random
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  private getUsers(): any[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  }

  private saveUsers(users: any[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }
}
