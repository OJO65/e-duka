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
    currency: 'KES',
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
    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      if (cart.items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  formatPrice(price: number): string {
    return 'KES ' + new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  placeOrder(): void {
    if (this.cart.items.length === 0) {
      this.error = 'Your cart is empty';
      return;
    }

    if (!this.currentUser) {
      this.error = 'You must be logged in to place an order';
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.loading = true;
    this.error   = '';

    // Use phone from user profile, fall back to placeholder
    const phone   = this.currentUser.phone || '0700000000';
    const address = { street: 'TBD', city: 'Nairobi', county: 'Nairobi' };

    this.orderService.createOrder(phone, address).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.router.navigate(['/order-confirmation', res.order?.id || 'success']);
      },
      error: (err: any) => {
        console.error('Order error:', err);
        this.error   = 'Failed to place order. Please try again.';
        this.loading = false;
      },
    });
  }

  goToCart():        void { this.router.navigate(['/cart']); }
  continueShopping(): void { this.router.navigate(['/']); }
}