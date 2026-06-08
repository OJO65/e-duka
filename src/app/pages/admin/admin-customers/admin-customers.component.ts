import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/adminService/admin.service';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.css'],
})
export class AdminCustomersComponent implements OnInit {
  customers: any[] = [];
  loading    = true;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getCustomers().subscribe({
      next:  data => { this.customers = data; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  getTotalSpent(orders: any[]): number {
    return (orders || []).reduce((s, o) => s + Number(o.total_amount || 0), 0);
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
}