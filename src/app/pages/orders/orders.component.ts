import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/orderService/order.service';
import { AuthService } from '../../services/authService/auth.service';
import { Order, OrderStatus } from '../../models/user.model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
    orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedFilter: 'all' | OrderStatus = 'all';
  loading = true;

  private userSubscription?: Subscription;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadOrders(user.id);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  loadOrders(userId: number): void {
    this.loading = true;
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      this.orders = this.orderService.getOrdersByUserId(userId);
      this.filteredOrders = this.orders;
      this.loading = false;
    }, 500);
  }

  filterOrders(status: 'all' | OrderStatus): void {
    this.selectedFilter = status;
    
    if (status === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === status);
    }
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/order-confirmation', orderId]);
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: OrderStatus): string {
    const statusClasses: Record<OrderStatus, string> = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered'
    };
    return statusClasses[status];
  }

  getStatusIcon(status: OrderStatus): string {
    const icons: Record<OrderStatus, string> = {
      'pending': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'processing': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'shipped': 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
      'delivered': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[status];
  }

  getFilterCount(status: 'all' | OrderStatus): number {
    if (status === 'all') {
      return this.orders.length;
    }
    return this.orders.filter(order => order.status === status).length;
  }
}