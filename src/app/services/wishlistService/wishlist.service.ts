import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../authService/auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  readonly api = environment.apiUrl;

  private wishlistSubject = new BehaviorSubject<string[]>([]);
  wishlist$: Observable<string[]> = this.wishlistSubject.asObservable();

  constructor(public http: HttpClient, private auth: AuthService) {
    if (this.auth.isLoggedIn()) this.fetchWishlist();
    this.auth.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) this.fetchWishlist();
      else this.wishlistSubject.next([]);
    });
  }

  fetchWishlist(): void {
    this.http.get<any[]>(`${this.api}/wishlist`, { headers: this.headers() })
      .subscribe({
        next: items => {
          const ids = items.map((i: any) => i.products?.id ?? i.product_id);
          this.wishlistSubject.next(ids);
        },
        error: () => {}
      });
  }

  initializeWishlist(_userId: any): void { this.fetchWishlist(); }

  addToWishlist(_userId: any, productId: string): boolean {
    if (!this.auth.isLoggedIn()) return false;
    this.http.post<any>(`${this.api}/wishlist`, { product_id: productId }, { headers: this.headers() })
      .subscribe({ next: () => this.fetchWishlist(), error: () => {} });
    return true;
  }

  removeFromWishlist(_userId: any, productId: string): boolean {
    if (!this.auth.isLoggedIn()) return false;
    this.http.delete(`${this.api}/wishlist/${productId}`, { headers: this.headers() })
      .subscribe({ next: () => this.fetchWishlist(), error: () => {} });
    return true;
  }

  toggleWishlist(_userId: any, productId: string): boolean {
    if (this.isInWishlist(_userId, productId)) {
      this.removeFromWishlist(_userId, productId);
      return false;
    } else {
      this.addToWishlist(_userId, productId);
      return true;
    }
  }

  isInWishlist(_userId: any, productId: string): boolean {
    return this.wishlistSubject.value.includes(productId);
  }

  getWishlistCount(_userId: any): number { return this.wishlistSubject.value.length; }
  getWishlistByUserId(_userId: any): string[] { return this.wishlistSubject.value; }
  clearWishlist(_userId: any): boolean { this.wishlistSubject.next([]); return true; }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }
}