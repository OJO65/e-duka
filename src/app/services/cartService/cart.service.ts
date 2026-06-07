import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../authService/auth.service';
import { skip } from 'rxjs/operators';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  vendor: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
  availableForSale: boolean;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = environment.apiUrl;
  private readySubject = new BehaviorSubject<boolean>(false);

  private cartSubject = new BehaviorSubject<Cart>(this.emptyCart());
  private pendingSubject = new BehaviorSubject<Set<string>>(new Set());

  ready$: Observable<boolean> = this.readySubject.asObservable();
  cart$: Observable<Cart> = this.cartSubject.asObservable();
  pending$: Observable<Set<string>> = this.pendingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {
    if (!this.auth.isLoggedIn()) {
      this.readySubject.next(true);
    }

    this.auth.isLoggedIn$.pipe(skip(1)).subscribe((loggedIn) => {
      if (loggedIn) this.fetchCart();
      else {
        this.cartSubject.next(this.emptyCart());
        this.readySubject.next(true);
      }
    });

    if (this.auth.isLoggedIn()) {
      setTimeout(() => this.fetchCart(), 500);
    }
  }

  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }
  isPending(_id: string): boolean {
    return false;
  }

  fetchCart(): void {
    const token = this.auth.getToken();
    if (!token) {
      this.readySubject.next(true);
      return;
    }
    this.http
      .get<any[]>(`${this.api}/cart`, { headers: this.headers() })
      .subscribe({
        next: (items) => {
          this.cartSubject.next(this.buildCart(items));
          this.readySubject.next(true);
        },
        error: () => {
          this.readySubject.next(true);
        },
      });
  }

  addToCart(product: any, quantity: number = 1): void {
    if (!this.auth.isLoggedIn()) {
      alert('Please log in to add items to your cart.');
      return;
    }
    const variant = product.variants?.nodes?.[0];
    if (!variant?.id) return;

    const current = this.cartSubject.value;
    const existing = current.items.find((i) => i.productId === product.id);

    if (existing) {
      this.applyUpdate(existing.id, existing.quantity + quantity);
    } else {
      const newItem: CartItem = {
        id: `temp-${Date.now()}`,
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        vendor: product.vendor ?? '',
        image: product.images?.nodes?.[0]?.url ?? '',
        price: Number(product.priceRange?.minVariantPrice?.amount ?? 0),
        currency: 'KES',
        quantity,
        availableForSale: true,
      };
      this.cartSubject.next(
        this.recalculate({
          ...current,
          items: [...current.items, newItem],
        }),
      );
    }

    this.http
      .post<any>(
        `${this.api}/cart`,
        { product_id: product.id, variant_id: variant.id, quantity },
        { headers: this.headers() },
      )
      .subscribe({
        next: () => {},
        error: () => this.fetchCart(),
      });
  }

  updateQuantity(cartItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(cartItemId);
      return;
    }
    this.applyUpdate(cartItemId, quantity);
    this.http
      .patch<any>(
        `${this.api}/cart/${cartItemId}`,
        { quantity },
        { headers: this.headers() },
      )
      .subscribe({
        error: () => this.fetchCart(),
      });
  }

  removeFromCart(cartItemId: string): void {
    const current = this.cartSubject.value;
    this.cartSubject.next(
      this.recalculate({
        ...current,
        items: current.items.filter((i) => i.id !== cartItemId),
      }),
    );
    this.http
      .delete(`${this.api}/cart/${cartItemId}`, { headers: this.headers() })
      .subscribe({ error: () => this.fetchCart() });
  }

  clearCart(): void {
    this.cartSubject.next(this.emptyCart());
    this.http
      .delete(`${this.api}/cart`, { headers: this.headers() })
      .subscribe({ error: () => this.fetchCart() });
  }

  setUser(_userId: any): void {
    if (this.auth.isLoggedIn()) this.fetchCart();
  }
  mergeGuestCartIntoUser(_userId: any): void {}

  private applyUpdate(cartItemId: string, quantity: number): void {
    const current = this.cartSubject.value;
    this.cartSubject.next(
      this.recalculate({
        ...current,
        items: current.items.map((i) =>
          i.id === cartItemId ? { ...i, quantity } : i,
        ),
      }),
    );
  }

  private recalculate(cart: Cart): Cart {
    return {
      ...cart,
      subtotal: cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
      itemCount: cart.items.reduce((s, i) => s + i.quantity, 0),
    };
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  private buildCart(items: any[]): Cart {
    const mapped: CartItem[] = items.map((i) => ({
      id: i.id,
      productId: i.products?.id ?? i.product_id,
      variantId: i.product_variants?.id ?? i.variant_id,
      title: i.products?.title ?? '',
      vendor: i.products?.vendor ?? '',
      image: i.products?.images?.[0]?.url ?? '',
      price: i.product_variants?.price ?? 0,
      currency: i.product_variants?.currency_code ?? 'KES',
      quantity: i.quantity,
      availableForSale: i.product_variants?.available_for_sale ?? true,
    }));
    return this.recalculate({
      items: mapped,
      itemCount: 0,
      subtotal: 0,
      currency: mapped[0]?.currency ?? 'KES',
    });
  }

  private emptyCart(): Cart {
    return { items: [], itemCount: 0, subtotal: 0, currency: 'KES' };
  }
}
