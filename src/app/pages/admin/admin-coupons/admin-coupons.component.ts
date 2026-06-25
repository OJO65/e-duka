import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/authService/auth.service';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-coupons.component.html',
  styleUrls: ['./admin-coupons.component.css'],
})
export class AdminCouponsComponent implements OnInit {
  coupons:     any[]   = [];
  loading      = true;
  showForm     = false;
  submitting   = false;
  error        = '';
  success      = '';

  newCode            = '';
  newDiscount        = 10;
  newMaxUses         = 100;
  newExpiresAt       = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void { this.loadCoupons(); }

  loadCoupons(): void {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/admin/coupons`, {
      headers: { Authorization: `Bearer ${this.auth.getToken()}` }
    }).subscribe({
      next: (data) => { this.coupons = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  createCoupon(): void {
    if (!this.newCode || !this.newDiscount) {
      this.error = 'Code and discount are required'; return;
    }
    this.submitting = true;
    this.error      = '';
    this.success    = '';

    this.http.post<any>(`${environment.apiUrl}/admin/coupons`, {
      code:             this.newCode,
      discount_percent: this.newDiscount,
      max_uses:         this.newMaxUses,
      expires_at:       this.newExpiresAt || null,
    }, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } })
    .subscribe({
      next: () => {
        this.success    = 'Coupon created successfully!';
        this.submitting = false;
        this.showForm   = false;
        this.newCode    = '';
        this.newDiscount = 10;
        this.newMaxUses  = 100;
        this.newExpiresAt = '';
        this.loadCoupons();
      },
      error: (err) => {
        this.error      = err?.error?.error || 'Failed to create coupon';
        this.submitting = false;
      }
    });
  }

  toggleActive(coupon: any): void {
    this.http.patch<any>(`${environment.apiUrl}/admin/coupons/${coupon.id}`,
      { active: !coupon.active },
      { headers: { Authorization: `Bearer ${this.auth.getToken()}` } }
    ).subscribe({
      next: () => { coupon.active = !coupon.active; },
      error: () => {}
    });
  }

  isExpired(coupon: any): boolean {
    if (!coupon.expires_at) return false;
    return new Date(coupon.expires_at) < new Date();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}