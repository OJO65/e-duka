import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../authService/auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  readonly api = environment.apiUrl;

  // Stores product IDs currently in wishlist
  private wishlistSubject = new BehaviorSubject<string[]>([]);
  wishlist$: Observable<string[]> = this.wishlistSubject.asObservable();

  // Stores full product objects for the wishlist page
  private wishlistItemsSubject = new BehaviorSubject<any[]>([]);
  wishlistItems$: Observable<any[]> = this.wishlistItemsSubject.asObservable();

  constructor(
    public http: HttpClient,
    private auth: AuthService,
  ) {
    if (this.auth.isLoggedIn()) this.fetchWishlist();
    this.auth.isLoggedIn$.subscribe((loggedIn) => {
      if (loggedIn) this.fetchWishlist();
      else {
        this.wishlistSubject.next([]);
        this.wishlistItemsSubject.next([]);
      }
    });
  }

  fetchWishlist(): void {
    this.http
      .get<any[]>(`${this.api}/wishlist`, { headers: this.headers() })
      .subscribe({
        next: (items) => {
          // Store full items for wishlist page
          this.wishlistItemsSubject.next(items);
          // Store just IDs for isInWishlist checks
          const ids = items
            .map((i: any) => i.products?.id ?? i.product_id)
            .filter(Boolean);
          this.wishlistSubject.next(ids);
        },
        error: () => {},
      });
  }

  isInWishlist(_userId: any, productId: string): boolean {
    return this.wishlistSubject.value.includes(productId);
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

  addToWishlist(_userId: any, productId: string): boolean {
    if (!this.auth.isLoggedIn()) return false;

    const current = this.wishlistSubject.value;
    if (!current.includes(productId)) {
      this.wishlistSubject.next([...current, productId]);
    }

    this.http
      .post<any>(
        `${this.api}/wishlist`,
        { product_id: productId },
        { headers: this.headers() },
      )
      .subscribe({
        error: () => {
          this.wishlistSubject.next(
            this.wishlistSubject.value.filter((id) => id !== productId),
          );
        },
      });
    return true;
  }

  removeFromWishlist(_userId: any, productId: string): boolean {
    if (!this.auth.isLoggedIn()) return false;

    // Optimistic update
    this.wishlistSubject.next(
      this.wishlistSubject.value.filter((id) => id !== productId),
    );
    this.wishlistItemsSubject.next(
      this.wishlistItemsSubject.value.filter(
        (i: any) => (i.products?.id ?? i.product_id) !== productId,
      ),
    );

    this.http
      .delete(`${this.api}/wishlist/${productId}`, { headers: this.headers() })
      .subscribe({
        next: () => this.fetchWishlist(),
        error: () => this.fetchWishlist(),
      });
    return true;
  }

  clearWishlist(_userId: any): boolean {
    this.wishlistSubject.next([]);
    this.wishlistItemsSubject.next([]);
    // No bulk delete endpoint — remove one by one
    const ids = [...this.wishlistSubject.value];
    ids.forEach((productId) => {
      this.http
        .delete(`${this.api}/wishlist/${productId}`, {
          headers: this.headers(),
        })
        .subscribe();
    });
    return true;
  }

  // Legacy compat
  initializeWishlist(_userId: any): void {
    this.fetchWishlist();
  }
  getWishlistByUserId(_userId: any): string[] {
    return this.wishlistSubject.value;
  }
  getWishlistCount(_userId: any): number {
    return this.wishlistSubject.value.length;
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }
}
