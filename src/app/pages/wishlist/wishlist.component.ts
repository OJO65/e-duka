import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../services/wishlistService/wishlist.service';
import { AuthService } from '../../services/authService/auth.service';
import { CartService } from '../../services/cartService/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistProducts: any[] = [];
  loading = true;
  currentUserId: string | null = null;

  private userSubscription?: Subscription;
  private wishlistSubscription?: Subscription;

  constructor(
    private wishlistService: WishlistService,
    private authService:     AuthService,
    private cartService:     CartService,
    private router:          Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.loadWishlist();
      } else {
        this.router.navigate(['/login']);
      }
    });

    // Reload when wishlist changes
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe(() => {
      if (this.currentUserId) this.loadWishlist();
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.wishlistSubscription?.unsubscribe();
  }

  loadWishlist(): void {
    this.loading = true;
    this.wishlistService.fetchWishlist();

    // Give fetchWishlist a moment to complete then read from the observable
    setTimeout(() => {
      // wishlist$ emits product IDs — get full items from backend
      this.wishlistService['http']?.get<any[]>(
        `${this.wishlistService['api']}/wishlist`,
        { headers: { Authorization: `Bearer ${this.authService.getToken()}` } }
      ).subscribe({
        next: (items: any[]) => {
          this.wishlistProducts = items.map(i => ({
            id:              i.products?.id,
            title:           i.products?.title,
            images:          { nodes: (i.products?.images ?? []).map((img: any) => ({ url: img.url })) },
            priceRange:      {
              minVariantPrice: {
                amount:       String(i.products?.min_price ?? 0),
                currencyCode: i.products?.currency_code ?? 'KES',
              }
            },
            availableForSale: i.products?.available_for_sale ?? true,
            vendor:           i.products?.vendor ?? '',
            variants:         { nodes: i.products?.product_variants ?? [] },
          })).filter(p => p.id);
          this.loading = false;
        },
        error: () => {
          this.wishlistProducts = [];
          this.loading = false;
        }
      });
    }, 300);
  }

  removeFromWishlist(productId: string): void {
    if (!this.currentUserId) return;
    this.wishlistService.removeFromWishlist(this.currentUserId, productId);
  }

  addToCart(product: any): void {
    this.cartService.addToCart(product);
  }

  addAllToCart(): void {
    this.wishlistProducts.forEach(p => this.cartService.addToCart(p));
  }

  clearWishlist(): void {
    if (!this.currentUserId) return;
    if (confirm('Clear your entire wishlist?')) {
      this.wishlistService.clearWishlist(this.currentUserId);
      this.wishlistProducts = [];
    }
  }

  viewProduct(productId: string): void { this.router.navigate(['/product', productId]); }
  continueShopping(): void             { this.router.navigate(['/shop']); }

  formatPrice(amount: string, _currency?: string): string {
    return 'KES ' + new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  }

  getProductImage(product: any): string {
    return product?.images?.nodes?.[0]?.url || 'assets/placeholder.jpg';
  }
}