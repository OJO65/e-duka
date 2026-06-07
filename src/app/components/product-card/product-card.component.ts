import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cartService/cart.service';
import { WishlistService } from '../../services/wishlistService/wishlist.service';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product!: {
    id: string;
    title: string;
    vendor?: string;
    images: { nodes: Array<{ url: string }> };
    priceRange: {
      minVariantPrice: { amount: string; currencyCode?: string };
    };
    variants?: { nodes: any[] };
  };

  imageLoaded = false;
  imageError = false;
  toastMessage = '';
  showToast = false;
  isInWishlist = false;
  isLoggedIn = false;
  currentUserId: string | null = null; // ← string not number

  private toastTimeout: any;
  private authSub?: Subscription;
  private wishlistSub?: Subscription;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.currentUserId = user?.id ?? null;
      // Set initial wishlist state from service
      this.isInWishlist =
        user && this.product
          ? this.wishlistService.isInWishlist(user.id, this.product.id)
          : false;
    });
    // No wishlistSub — icon state managed locally
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }
  onImageLoad() {
    this.imageLoaded = true;
  }
  onImageError() {
    this.imageError = true;
    this.imageLoaded = false;
  }

  get productImage(): string {
    return this.product?.images?.nodes?.[0]?.url || 'assets/placeholder.jpg';
  }

  get formattedPrice(): string {
    const amount = Number(
      this.product?.priceRange?.minVariantPrice?.amount || 0,
    );
    return (
      'KES ' +
      new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    );
  }

  onAddToCart(): void {
    this.cartService.addToCart(this.product);
    this.showToastMessage(`${this.product.title} added to cart`);
  }

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    if (!this.currentUserId) return;

    this.isInWishlist = !this.isInWishlist;
    const added = this.isInWishlist;

    if (added) {
      this.wishlistService.addToWishlist(this.currentUserId, this.product.id);
    } else {
      this.wishlistService.removeFromWishlist(
        this.currentUserId,
        this.product.id,
      );
    }

    this.showToastMessage(
      added
        ? `${this.product.title} added to wishlist`
        : `${this.product.title} removed from wishlist`,
    );
  }

  onViewDetails(): void {
    this.router.navigate(['/product', this.product.id]);
  }

  private showToastMessage(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 1500);
  }
}
