import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cartService/cart.service';
import { AuthService } from '../../services/authService/auth.service';
import { OrderService } from '../../services/orderService/order.service';
import { Cart, CartItem } from '../../services/cartService/cart.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  loading = false;
  error = '';
  step: 'summary' | 'payment' | 'confirmed' = 'summary';

  // Delivery details
  phone = '';
  deliveryStreet = '';
  deliveryCity = 'Kisumu';
  deliveryCounty = 'Kisumu';
  loadingMessage = 'Processing your order...';

  // Coupon
  couponCode = '';
  couponLoading = false;
  couponApplied = false;
  couponError = '';
  couponDiscount = 0;
  couponId = '';

  // GNET Till Number
  readonly tillNumber = '5120455';
  orderId = '';
  orderTotal = 0;

  private cartSub?: Subscription;
  private userSub?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Redirect guests to login immediately, with returnUrl back to checkout
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
      return;
    }

    this.cartSub = this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      if (!this.loading && cart.items.length === 0 && this.step === 'summary') {
        this.router.navigate(['/cart']);
      }
    });

    this.userSub = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user?.phone) this.phone = user.phone;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  formatPrice(price: number, _currency?: string): string {
    return (
      'KES ' +
      new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price)
    );
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  // Step 1 → Step 2: create order then show M-Pesa instructions
  placeOrder(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
      return;
    }
    if (!this.phone) {
      this.error = 'Please enter your phone number';
      return;
    }
    if (!this.deliveryStreet) {
      this.error = 'Please enter your delivery address';
      return;
    }

    this.loading = true;
    this.error = '';

    this.orderService
      .createOrder(this.phone, {
        street: this.deliveryStreet,
        city: this.deliveryCity,
        county: this.deliveryCounty,
      })
      .subscribe({
        next: (res: any) => {
          this.loading = true;
          this.error = '';
          this.orderId = res.order?.id || '';
          this.orderTotal = this.finalTotal;
          this.step = 'payment';
          this.loadingMessage = 'processing your order...';

          // Show reassuring message after 5 seconds if still loading
          const messageTimer = setTimeout(() => {
            if (this.loading) {
              this.loadingMessage = 'Almost there, please wait...';
            }
          }, 5000);

          // Show another message after 15 seconds
          const messageTimer2 = setTimeout(() => {
            if (this.loading) {
              this.loadingMessage = 'Still working, hang tight...';
            }
          }, 15000);

          this.orderService
            .createOrder(this.phone, {
              street: this.deliveryStreet,
              city: this.deliveryCity,
              county: this.deliveryCounty,
            })
            .pipe(timeout(30000))
            .subscribe({
              next: (res: any) => {
                clearTimeout(messageTimer);
                clearTimeout(messageTimer2);
                this.loading = false;
                this.orderId = res.order?.id || '';
                this.orderTotal = this.finalTotal;
                this.step = 'payment';

                if (this.couponId) {
                  const token = this.authService.getToken();
                  this.http
                    .post(
                      `${environment.apiUrl}/coupons/apply`,
                      { coupon_id: this.couponId },
                      { headers: { Authorization: `Bearer ${token}` } },
                    )
                    .subscribe();
                }
              },
              error: (err) => {
                clearTimeout(messageTimer);
                clearTimeout(messageTimer2);
                this.loading = false;
                if (err?.name === 'TimeoutError') {
                  this.error =
                    'Request timed out. Please check your connection and try again.';
                } else {
                  this.error =
                    err?.error?.error ||
                    'Failed to place order. Please try again.';
                }
              },
            });

          // Mark coupon as used if one was applied
          if (this.couponId) {
            const token = this.authService.getToken();
            this.http
              .post(
                `${environment.apiUrl}/coupons/apply`,
                { coupon_id: this.couponId },
                { headers: { Authorization: `Bearer ${token}` } },
              )
              .subscribe();
          }
        },
      });
  }

  // Step 2 → Step 3: user confirms they have paid
  confirmPayment(): void {
    this.step = 'confirmed';
    this.cartService.clearCart();
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }
  goToCart(): void {
    this.router.navigate(['/cart']);
  }
  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  get discountAmount(): number {
    return Math.round((this.cart.subtotal * this.couponDiscount) / 100);
  }

  get finalTotal(): number {
    return this.cart.subtotal - this.discountAmount;
  }

  validateCoupon(): void {
    if (!this.couponCode.trim()) return;
    this.couponLoading = true;
    this.couponError = '';

    const token = this.authService.getToken();
    this.http
      .post<any>(
        `${environment.apiUrl}/coupons/validate`,
        { code: this.couponCode },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .subscribe({
        next: (res) => {
          this.couponApplied = true;
          this.couponDiscount = res.discount_percent;
          this.couponId = res.coupon_id;
          this.couponLoading = false;
        },
        error: (err) => {
          this.couponError = err?.error?.error || 'Invalid coupon code';
          this.couponLoading = false;
        },
      });
  }

  get vatAmount(): number {
    const exclusive = this.finalTotal / 1.16;
    return Math.round(this.finalTotal - exclusive);
  }

  removeCoupon(): void {
    this.couponApplied = false;
    this.couponDiscount = 0;
    this.couponId = '';
    this.couponCode = '';
    this.couponError = '';
  }
}
