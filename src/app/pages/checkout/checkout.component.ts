import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cartService/cart.service';
import { AuthService } from '../../services/authService/auth.service';
import { OrderService } from '../../services/orderService/order.service';
import { Cart, CartItem } from '../../models/cart.model';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart: Cart = {
    items: [],
    itemCount: 0,
    subtotal: 0,
    currency: 'USD',
  };

  currentUser: User | null = null;
  loading: boolean = false;
  error: string = '';

  private cartSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart
    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;

      // Redirect to cart if empty
      if (cart.items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });

    // Subscribe to current user
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  formatPrice(price: number, currency?: string): string {
    const curr = currency || this.cart.currency || 'USD';

    let formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);

    if (curr === 'CAD') {
      formatted = formatted.replace(/^CA/, '');
    }

    return formatted;
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  /**
   * Place order locally (no external payment processing)
   */
  placeOrder(): void {
  console.log('1. placeOrder called');
  console.log('Cart items:', this.cart.items);
  console.log('Current user:', this.currentUser);

  if (this.cart.items.length === 0) {
    this.error = 'Your cart is empty';
    return;
  }

  if (!this.currentUser) {
    console.log('No user found, redirecting to login');
    this.error = 'You must be logged in to place an order';
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    return;
  }

  this.loading = true;
  this.error = '';

  console.log('2. Starting order creation timeout');

  setTimeout(() => {
    try {
      console.log('3. Creating order...');
      const order = this.orderService.createOrder(this.cart, this.currentUser!.id);
      console.log('4. Order created:', order);

      console.log('5. Clearing cart...');
      this.cartService.clearCart();

      this.loading = false;
      console.log('6. Navigating to confirmation...');

      this.router.navigate(['/order-confirmation', order.id]);
      console.log('7. Navigation called');
    } catch (error: any) {
      console.error('Order creation error:', error);
      this.error = 'Failed to place order. Please try again.';
      this.loading = false;
    }
  }, 1000);
}

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }
}