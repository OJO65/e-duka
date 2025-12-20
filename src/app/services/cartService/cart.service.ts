import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Cart } from '../../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_KEY = 'eduka_cart';

  // BehaviorSubject holds the cart state
  private cartSubject = new BehaviorSubject<Cart>(this.loadFromStorage());

  // Observable that components can subscribe to
  public cart$: Observable<Cart> = this.cartSubject.asObservable();

  constructor() {
    // Save to localStorage whenever cart changes
    this.cart$.subscribe((cart) => this.saveToStorage(cart));
  }

  // Get current cart value (synchronous)
  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  // Add product to cart
  addToCart(product: any, quantity: number = 1): void {
    const cart = this.getCurrentCart();
    const existingItem = cart.items.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      // Increase quantity
      existingItem.quantity += quantity;
    } else {
      // Ensure we have a valid variant
      const variant = product.variants?.nodes?.[0];

      if (!variant || !variant.id) {
        console.error('Product missing variants:', product);
        // Show user-friendly error instead of throwing
        alert(
          `Sorry, "${product.title}" cannot be added to cart. Please try refreshing the page.`
        );
        return;
      }

      // Add new item using variant data
      const newItem: CartItem = {
        productId: product.id,
        variantId: variant.id, // Use actual variant ID
        title: product.title,
        vendor: product.vendor || '',
        image: product.images.nodes[0]?.url || '',
        price: parseFloat(
          variant.priceV2?.amount || product.priceRange.minVariantPrice.amount
        ),
        currency:
          variant.priceV2?.currencyCode ||
          product.priceRange.minVariantPrice.currencyCode,
        quantity: quantity,
        availableForSale: product.availableForSale && variant.availableForSale,
      };
      cart.items.push(newItem);
    }

    this.updateCart(cart);
  }

  // Remove item from cart
  removeFromCart(productId: string): void {
    const cart = this.getCurrentCart();
    cart.items = cart.items.filter((item) => item.productId !== productId);
    this.updateCart(cart);
  }

  // Update quantity
  updateQuantity(productId: string, quantity: number): void {
    const cart = this.getCurrentCart();
    const item = cart.items.find((item) => item.productId === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.updateCart(cart);
      }
    }
  }

  // Clear entire cart
  clearCart(): void {
    const emptyCart: Cart = {
      items: [],
      itemCount: 0,
      subtotal: 0,
      currency: 'USD',
    };
    this.updateCart(emptyCart);
  }

  // Private: Update cart and recalculate totals
  private updateCart(cart: Cart): void {
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cart.currency = cart.items[0]?.currency || 'USD';

    this.cartSubject.next(cart);
  }

  // Private: Save to localStorage
  private saveToStorage(cart: Cart): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  // Private: Load from localStorage
  private loadFromStorage(): Cart {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }

    // Return empty cart if nothing saved
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      currency: 'USD',
    };
  }
}
