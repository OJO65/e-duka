import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/orderService/order.service';
import { AuthService } from '../../services/authService/auth.service';
import { Order } from '../../models/user.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
 order: Order | null = null;
  loading = true;
  estimatedDelivery: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get order ID from route params
    const orderId = this.route.snapshot.paramMap.get('id');
    const currentUser = this.authService.getCurrentUser();

    if (!orderId || !currentUser) {
      // Redirect to orders page if no order ID or user
      this.router.navigate(['/orders']);
      return;
    }

    // Load order details
    this.order = this.orderService.getOrderById(orderId, currentUser.id);

    if (!this.order) {
      // Order not found, redirect to orders
      this.router.navigate(['/orders']);
      return;
    }

    // Calculate estimated delivery (5-7 business days)
    this.estimatedDelivery = this.calculateDeliveryDate();
    this.loading = false;
  }

formatPrice(price: number, currency?: string): string {
  const curr = currency || 'USD';  // Default to USD
  
  let formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: curr,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  
  // Remove "CA" prefix from Canadian dollars if needed
  if (curr === 'CAD') {
    formatted = formatted.replace(/^CA/, '');
  }
  
  return formatted;
}

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDeliveryDate(): string {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 6); // 5-7 days average = 6 days
    
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  printOrder(): void {
    window.print();
  }
}