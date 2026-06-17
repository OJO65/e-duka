import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cartService/cart.service';
import { AuthService } from '../../services/authService/auth.service';
import { OrderService } from '../../services/orderService/order.service';
import { Cart, CartItem } from '../../services/cartService/cart.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart: Cart = { items: [], itemCount: 0, subtotal: 0, currency: 'KES' };
  currentUser: User | null = null;
  loading  = false;
  error    = '';
  step: 'summary' | 'payment' | 'confirmed' = 'summary';

  // Delivery details
  phone           = '';
  deliveryStreet  = '';
  deliveryCity    = 'Nairobi';
  deliveryCounty  = 'Nairobi';

  // GNET Till Number
  readonly tillNumber = '5120455';
  orderId = '';
  orderTotal = 0;

  private cartSub?: Subscription;
  private userSub?: Subscription;

  constructor(
    private cartService:  CartService,
    private authService:  AuthService,
    private orderService: OrderService,
    private router:       Router
  ) {}

  ngOnInit(): void {
    this.cartSub = this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      if (!this.loading && cart.items.length === 0 && this.step === 'summary') {
        this.router.navigate(['/cart']);
      }
    });

    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.phone) this.phone = user.phone;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  formatPrice(price: number, _currency?: string): string {
    return 'KES ' + new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  getItemTotal(item: CartItem): number { return item.price * item.quantity; }

  // Step 1 → Step 2: create order then show M-Pesa instructions
  placeOrder(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    if (!this.phone) { this.error = 'Please enter your phone number'; return; }
    if (!this.deliveryStreet) { this.error = 'Please enter your delivery address'; return; }

    this.loading = true;
    this.error   = '';

    this.orderService.createOrder(this.phone, {
      street: this.deliveryStreet,
      city:   this.deliveryCity,
      county: this.deliveryCounty,
    }).subscribe({
      next: (res: any) => {
        this.loading    = false;
        this.orderId    = res.order?.id || '';
        this.orderTotal = this.cart.subtotal;
        this.step       = 'payment';
      },
      error: (err: any) => {
        this.loading = false;
        this.error   = err?.error?.error || 'Failed to place order. Please try again.';
      },
    });
  }

  // Step 2 → Step 3: user confirms they have paid
confirmPayment(): void {
  this.step = 'confirmed';
  this.cartService.clearCart();
}

  continueShopping(): void { this.router.navigate(['/']); }
  goToCart():        void { this.router.navigate(['/cart']); }
  goToOrders():      void { this.router.navigate(['/orders']); }
}