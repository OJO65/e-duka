import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/orderService/order.service';
import { AuthService } from '../../services/authService/auth.service';
import { OrderStatus } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  filteredOrders: any[] = [];
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
        this.loadOrders();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (orders: any[]) => {
        this.orders         = orders;
        this.filteredOrders = orders;
        this.loading        = false;
      },
      error: () => {
        this.orders         = [];
        this.filteredOrders = [];
        this.loading        = false;
      },
    });
  }

  filterOrders(status: 'all' | OrderStatus): void {
    this.selectedFilter = status;
    this.filteredOrders = status === 'all'
      ? this.orders
      : this.orders.filter(o => o.status === status);
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/order-confirmation', orderId]);
  }

  continueShopping(): void { this.router.navigate(['/shop']); }

  shortId(id: string): string {
    return id ? id.slice(0, 8).toUpperCase() : '';
  }

  orderItemCount(order: any): number {
    return (order.order_items || []).length;
  }

formatPrice(price: number, _currency?: string): string {
  const safePrice = Number(price) || 0;
  return 'KES ' + new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safePrice);
}

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending:    'status-pending',
      processing: 'status-processing',
      shipped:    'status-shipped',
      delivered:  'status-delivered',
    };
    return map[status] ?? 'status-pending';
  }

  getStatusIcon(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      processing: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      shipped:    'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
      delivered:  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return map[status] ?? '';
  }

  getFilterCount(status: 'all' | OrderStatus): number {
    return status === 'all'
      ? this.orders.length
      : this.orders.filter(o => o.status === status).length;
  }
}