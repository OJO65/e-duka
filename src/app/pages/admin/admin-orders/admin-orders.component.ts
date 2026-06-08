import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/adminService/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
})
export class AdminOrdersComponent implements OnInit {
  orders:  any[] = [];
  loading  = true;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getOrders().subscribe({
      next:  data => { this.orders = data; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  updateStatus(id: string, status: string): void {
    this.admin.updateOrderStatus(id, status).subscribe({
      next: (updated) => {
        const order = this.orders.find(o => o.id === id);
        if (order) order.status = updated.status;
      }
    });
  }

  updatePaymentStatus(id: string, status: string, paymentStatus: string): void {
    this.admin.updateOrderStatus(id, status, paymentStatus).subscribe({
      next: (updated) => {
        const order = this.orders.find(o => o.id === id);
        if (order) order.payment_status = updated.payment_status;
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  formatNumber(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);
  }

  getStatusClass(status: string): string {
    const map: any = {
      pending:   'badge-warning',
      confirmed: 'badge-info',
      shipped:   'badge-primary',
      delivered: 'badge-success',
    };
    return map[status] || 'badge-default';
  }
}