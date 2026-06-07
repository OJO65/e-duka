import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/orderService/order.service';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  order: any        = null;
  loading           = true;
  estimatedDelivery = '';

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private orderService: OrderService,
    private authService:  AuthService
  ) {}

  ngOnInit(): void {
    const orderId     = this.route.snapshot.paramMap.get('id');
    const currentUser = this.authService.getCurrentUser();

    if (!orderId || !currentUser) { this.router.navigate(['/orders']); return; }

    this.orderService.getOrderById(orderId).subscribe({
      next: (order: any) => {
        this.order             = order;
        this.estimatedDelivery = this.calculateDeliveryDate();
        this.loading           = false;
      },
      error: () => { this.router.navigate(['/orders']); }
    });
  }

  formatPrice(price: number, _currency?: string): string {
    return 'KES ' + new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  private calculateDeliveryDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-KE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  viewAllOrders():    void { this.router.navigate(['/orders']); }
  goToOrders():       void { this.router.navigate(['/orders']); }
  continueShopping(): void { this.router.navigate(['/']); }
  printOrder():       void { if (typeof window !== 'undefined') window.print(); }
}