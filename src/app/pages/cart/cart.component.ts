import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cartService/cart.service';
import { Cart, CartItem } from '../../models/cart.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = {
    items: [],
    itemCount: 0,
    subtotal: 0,
    currency: 'USD',
  };

  private cartSubscription?: Subscription;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) return;
    this.cartService.updateQuantity(productId, newQuantity);
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId, item.quantity - 1);
    }
  }

  removeItem(productId: string): void {
    if (confirm('Remove this item from cart?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  formatPrice(price: number, currency: string): string {
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
}
