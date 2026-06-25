import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, Cart, CartItem } from '../../services/cartService/cart.service';
import { CartDrawerService } from '../../services/cartDrawer/cart-drawer.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.css'],
})
export class CartDrawerComponent implements OnInit, OnDestroy {
  cart: Cart = { items: [], itemCount: 0, subtotal: 0, currency: 'KES' };
  isOpen = false;
  private subs: Subscription[] = [];

  constructor(
    private cartService: CartDrawerService,
    private cartData: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.cartService.open$.subscribe(open => this.isOpen = open),
      this.cartData.cart$.subscribe(cart => this.cart = cart),
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  close(): void { this.cartService.close(); }

  removeItem(id: string): void { this.cartData.removeFromCart(id); }

  updateQty(item: CartItem, delta: number): void {
    this.cartData.updateQuantity(item.id, item.quantity + delta);
  }

  goToCheckout(): void {
    this.cartService.close();
    this.router.navigate(['/checkout']);
  }

  goToCart(): void {
    this.cartService.close();
    this.router.navigate(['/cart']);
  }

  formatPrice(amount: number): string {
    return 'KES ' + new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}