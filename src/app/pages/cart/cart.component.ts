import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CartService,
  Cart,
  CartItem,
} from '../../services/cartService/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = { items: [], itemCount: 0, subtotal: 0, currency: 'KES' };
  isLoading = true;

  private cartSub?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cartSub = this.cartService.cart$.subscribe(
      (cart) => (this.cart = cart),
    );

    this.cartService.ready$.subscribe((ready) => {
      if (ready) this.isLoading = false;
    });

    // Fallback
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1)
      this.cartService.updateQuantity(item.id, item.quantity - 1);
  }

  removeItem(item: CartItem): void {
    if (confirm('Remove this item from cart?')) {
      this.cartService.removeFromCart(item.id);
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
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
  continueShopping(): void {
    this.router.navigate(['/']);
  }
  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
