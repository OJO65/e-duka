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
  loading      = true;
  authChecking = true;

  showToast    = false;
  toastMessage = '';

  private toastTimeout: any;
  private emptyStateTimeout: any;
  private hasReceivedRealData = false;

  private itemsSub?: Subscription;
  private userSub?: Subscription;

  constructor(
    private wishlistService: WishlistService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user: any) => {
      // CRITICAL FIX: ignore the synchronous initial `null` emission that
      // fires before the AuthService constructor finishes reading localStorage.
      // Only act once we are CERTAIN of the real state.
      if (user === null) {
        // Could be "not logged in" OR "not yet checked" — wait a tick to be sure.
        setTimeout(() => {
          if (!this.authService.getCurrentUser()) {
            this.authChecking = false;
            this.router.navigate(['/login']);
          }
        }, 50);
        return;
      }

      this.authChecking = false;
      this.wishlistService.fetchWishlist();
    });

    // Hard safety net
    setTimeout(() => { this.authChecking = false; }, 1500);

    this.itemsSub = this.wishlistService.wishlistItems$.subscribe(
      (items: any[]) => {
        if (!this.hasReceivedRealData && items.length === 0) {
          this.scheduleEmptyStateReveal();
          return;
        }

        this.hasReceivedRealData = true;
        if (this.emptyStateTimeout) clearTimeout(this.emptyStateTimeout);

        this.wishlistProducts = items
          .map((i: any) => ({
            id: i.products?.id,
            title: i.products?.title ?? '',
            vendor: i.products?.vendor ?? '',
            images: {
              nodes: (i.products?.images ?? []).map((img: any) => ({
                url: img.url,
              })),
            },
            priceRange: {
              minVariantPrice: {
                amount: String(i.products?.min_price ?? 0),
                currencyCode: i.products?.currency_code ?? 'KES',
              },
            },
            availableForSale: i.products?.available_for_sale ?? true,
            variants: {
              nodes: (i.products?.product_variants ?? []).map((v: any) => ({
                id: v.id,
                title: v.title,
                availableForSale: v.available_for_sale,
                quantityAvailable: v.quantity_available,
                priceV2: {
                  amount: String(v.price),
                  currencyCode: v.currency_code ?? 'KES',
                },
                selectedOptions: v.selected_options ?? [],
              })),
            },
          }))
          .filter((p: any) => p.id);
        this.loading = false;
      },
    );
  }

  ngOnDestroy(): void {
    this.itemsSub?.unsubscribe();
    this.userSub?.unsubscribe();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    if (this.emptyStateTimeout) clearTimeout(this.emptyStateTimeout);
  }

  private scheduleEmptyStateReveal(): void {
    if (this.emptyStateTimeout) clearTimeout(this.emptyStateTimeout);
    this.emptyStateTimeout = setTimeout(() => {
      if (!this.hasReceivedRealData) {
        this.hasReceivedRealData = true;
        this.wishlistProducts    = [];
        this.loading              = false;
      }
    }, 400);
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.removeFromWishlist(null, productId);
  }

  addToCart(product: any): void {
    this.cartService.addToCart(product);
    this.showToastMessage(`${product.title} added to cart!`);
  }

  addAllToCart(): void {
    this.wishlistProducts.forEach((p: any) => this.cartService.addToCart(p));
    this.showToastMessage(`${this.wishlistProducts.length} items added to cart!`);
  }

  clearWishlist(): void {
    if (confirm('Clear your entire wishlist?')) {
      this.wishlistService.clearWishlist(null);
      this.wishlistProducts = [];
    }
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  formatPrice(amount: string | number, _currency?: string): string {
    return (
      'KES ' +
      new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(amount))
    );
  }

  getProductImage(product: any): string {
    return product?.images?.nodes?.[0]?.url || 'assets/placeholder.jpg';
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast     = false;
    setTimeout(() => { this.showToast = true; });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => { this.showToast = false; }, 2000);
  }
}