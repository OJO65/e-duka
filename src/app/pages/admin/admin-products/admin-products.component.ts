import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/adminService/admin.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css'],
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  loading   = true;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getProducts().subscribe({
      next:  data => { this.products = data; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  toggleAvailability(product: any): void {
    const newValue = !product.available_for_sale;
    this.admin.updateProduct(product.id, { available_for_sale: newValue }).subscribe({
      next: () => { product.available_for_sale = newValue; }
    });
  }

  formatNumber(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);
  }
}