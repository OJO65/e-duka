import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/adminService/admin.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css'],
})
export class AdminOverviewComponent implements OnInit {
  stats: any = null;
  loading    = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next:  data => { this.stats = data; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  formatPrice(amount: number): string {
    return 'KES ' + new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
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