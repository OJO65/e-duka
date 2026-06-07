import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../authService/auth.service';

export interface CartItem {
  id:               string;
  productId:        string;
  variantId:        string;
  title:            string;
  vendor:           string;
  image:            string;
  price:            number;
  currency:         string;
  quantity:         number;
  availableForSale: boolean;
}

export interface Cart {
  items:     CartItem[];
  itemCount: number;
  subtotal:  number;
  currency:  string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = environment.apiUrl;

  private cartSubject = new BehaviorSubject<Cart>(this.emptyCart());
  cart$: Observable<Cart> = this.cartSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
    if (this.auth.isLoggedIn()) this.fetchCart();
    this.auth.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) this.fetchCart();
      else this.cartSubject.next(this.emptyCart());
    });
  }

  getCurrentCart(): Cart { return this.cartSubject.value; }

  fetchCart(): void {
    this.http.get<any[]>(`${this.api}/cart`, { headers: this.headers() })
      .subscribe({ next: items => this.cartSubject.next(this.buildCart(items)), error: () => {} });
  }

  addToCart(product: any, quantity: number = 1): void {
    if (!this.auth.isLoggedIn()) { alert('Please log in to add items to your cart.'); return; }
    const variant = product.variants?.nodes?.[0];
    if (!variant?.id) { alert(`"${product.title}" cannot be added.`); return; }
    this.http.post<any>(`${this.api}/cart`,
      { product_id: product.id, variant_id: variant.id, quantity },
      { headers: this.headers() }
    ).subscribe({ next: () => this.fetchCart(), error: e => console.error(e) });
  }

  updateQuantity(cartItemId: string, quantity: number): void {
    if (quantity <= 0) { this.removeFromCart(cartItemId); return; }
    this.http.patch<any>(`${this.api}/cart/${cartItemId}`, { quantity }, { headers: this.headers() })
      .subscribe({ next: () => this.fetchCart() });
  }

  removeFromCart(cartItemId: string): void {
    this.http.delete(`${this.api}/cart/${cartItemId}`, { headers: this.headers() })
      .subscribe({ next: () => this.fetchCart() });
  }

  clearCart(): void {
    this.http.delete(`${this.api}/cart`, { headers: this.headers() })
      .subscribe({ next: () => this.cartSubject.next(this.emptyCart()) });
  }

  setUser(_userId: any): void { if (this.auth.isLoggedIn()) this.fetchCart(); }
  mergeGuestCartIntoUser(_userId: any): void {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  private buildCart(items: any[]): Cart {
    const mapped: CartItem[] = items.map(i => ({
      id:               i.id,
      productId:        i.products?.id         ?? i.product_id,
      variantId:        i.product_variants?.id  ?? i.variant_id,
      title:            i.products?.title       ?? '',
      vendor:           i.products?.vendor      ?? '',
      image:            i.products?.images?.[0]?.url ?? '',
      price:            i.product_variants?.price ?? 0,
      currency:         i.product_variants?.currency_code ?? 'KES',
      quantity:         i.quantity,
      availableForSale: i.product_variants?.available_for_sale ?? true,
    }));
    const subtotal  = mapped.reduce((s, i) => s + i.price * i.quantity, 0);
    const itemCount = mapped.reduce((s, i) => s + i.quantity, 0);
    return { items: mapped, itemCount, subtotal, currency: mapped[0]?.currency ?? 'KES' };
  }

  private emptyCart(): Cart {
    return { items: [], itemCount: 0, subtotal: 0, currency: 'KES' };
  }
}