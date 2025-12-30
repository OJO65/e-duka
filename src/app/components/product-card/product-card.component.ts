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
    images: { nodes: Array<{ url: string }> };
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode?: string;
      };
    };
  };

  imageLoaded: boolean = false;
  imageError: boolean = false;
  toastMessage: string = '';
  showToast: boolean = false;

  // Wishlist state
  isInWishlist: boolean = false;
  isLoggedIn: boolean = false;
  currentUserId: number | null = null;

  private toastTimeout: any;
  private authSubscription?: Subscription;
  private wishlistSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.currentUserId = user?.id || null;

      // Check if product is in wishlist
      if (user && this.product) {
        this.isInWishlist = this.wishlistService.isInWishlist(user.id, this.product.id);
      } else {
        this.isInWishlist = false;
      }
    });

    // Subscribe to wishlist changes
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe(() => {
      if (this.currentUserId && this.product) {
        this.isInWishlist = this.wishlistService.isInWishlist(this.currentUserId, this.product.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.wishlistSubscription?.unsubscribe();
    
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
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
      this.product?.priceRange?.minVariantPrice?.amount || 0
    );

    let formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return formatted;
  }

  onAddToCart() {
    this.cartService.addToCart(this.product);

    this.toastMessage = `${this.product.title} added to cart`;
    this.showToast = false;

    setTimeout(() => {
      this.showToast = true;
    });

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 800);
  }

  onToggleWishlist(event: Event) {
    event.stopPropagation(); // Prevent card flip when clicking heart

    if (!this.isLoggedIn) {
      // Redirect to login if not logged in
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    if (!this.currentUserId) return;

    // Toggle wishlist
    const added = this.wishlistService.toggleWishlist(this.currentUserId, this.product.id);

    // Show toast notification
    this.toastMessage = added 
      ? `Added to wishlist` 
      : `Removed from wishlist`;
    
    this.showToast = false;

    setTimeout(() => {
      this.showToast = true;
    });

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 800);
  }

  onViewDetails() {
    this.router.navigate(['/product', this.product.id]);
  } 
  }