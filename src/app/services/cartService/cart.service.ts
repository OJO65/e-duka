import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Cart } from '../../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly GUEST_KEY = 'eduka_cart_guest';

  private currentUserId: number | null = null;

  private cartSubject = new BehaviorSubject<Cart>(this.createEmptyCart());
  public cart$: Observable<Cart> = this.cartSubject.asObservable();

  constructor() {
    // Load initial cart (guest by default)
    const initialCart = this.loadFromStorage();
    this.cartSubject.next(initialCart);

    // Persist cart on every change
    this.cart$.subscribe(cart => {
      this.saveToStorage(cart);
    });
  }

  /* ========================
     PUBLIC API (UNCHANGED)
     ======================== */

  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  addToCart(product: any, quantity: number = 1): void {
    const cart = this.getCurrentCart();

    const existingItem = cart.items.find(
      item => item.productId === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const variant = product.variants?.nodes?.[0];

      if (!variant || !variant.id) {
        alert(`"${product.title}" cannot be added to cart.`);
        return;
      }

      const newItem: CartItem = {
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        vendor: product.vendor || '',
        image: product.images.nodes[0]?.url || '',
        price: parseFloat(
          variant.priceV2?.amount ||
            product.priceRange.minVariantPrice.amount
        ),
        currency:
          variant.priceV2?.currencyCode ||
          product.priceRange.minVariantPrice.currencyCode,
        quantity,
        availableForSale:
          product.availableForSale && variant.availableForSale,
      };

      cart.items.push(newItem);
    }

    this.updateCart(cart);
  }

  removeFromCart(productId: string): void {
    const cart = this.getCurrentCart();
    cart.items = cart.items.filter(
      item => item.productId !== productId
    );
    this.updateCart(cart);
  }

  updateQuantity(productId: string, quantity: number): void {
    const cart = this.getCurrentCart();
    const item = cart.items.find(
      item => item.productId === productId
    );

    if (!item) return;

    if (quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      item.quantity = quantity;
      this.updateCart(cart);
    }
  }

  clearCart(): void {
    this.updateCart(this.createEmptyCart());
  }

  /* ========================
     AUTH INTEGRATION
     ======================== */

  setUser(userId: number | null): void {
    this.currentUserId = userId;
    const cart = this.loadFromStorage();
    this.cartSubject.next(cart);
  }

  mergeGuestCartIntoUser(userId: number): void {
    const guestCart = this.getStoredCart(this.GUEST_KEY);
    if (!guestCart || guestCart.items.length === 0) return;

    const userKey = this.getUserKey(userId);
    const userCart =
      this.getStoredCart(userKey) || this.createEmptyCart();

    guestCart.items.forEach(guestItem => {
      const existing = userCart.items.find(
        item => item.variantId === guestItem.variantId
      );

      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    });

    this.updateCart(userCart);
    localStorage.setItem(userKey, JSON.stringify(userCart));
    localStorage.removeItem(this.GUEST_KEY);
  }

  /* ========================
     INTERNAL HELPERS
     ======================== */

  private updateCart(cart: Cart): void {
    cart.itemCount = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    cart.currency = cart.items[0]?.currency || 'USD';
    this.cartSubject.next({ ...cart });
  }

  private saveToStorage(cart: Cart): void {
    const key = this.currentUserId
      ? this.getUserKey(this.currentUserId)
      : this.GUEST_KEY;

    localStorage.setItem(key, JSON.stringify(cart));
  }

  private loadFromStorage(): Cart {
    const key = this.currentUserId
      ? this.getUserKey(this.currentUserId)
      : this.GUEST_KEY;

    return this.getStoredCart(key) || this.createEmptyCart();
  }

  private getStoredCart(key: string): Cart | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private getUserKey(userId: number): string {
    return `eduka_cart_user_${userId}`;
  }

  private createEmptyCart(): Cart {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      currency: 'USD',
    };
  }
}
