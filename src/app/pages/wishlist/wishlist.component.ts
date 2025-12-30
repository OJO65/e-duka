import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../services/wishlistService/wishlist.service';
import { AuthService } from '../../services/authService/auth.service';
import { ProductService } from '../../services/productService/product.service';
import { CartService } from '../../services/cartService/cart.service';
import { Subscription, forkJoin } from 'rxjs';

interface WishlistProduct {
  id: string;
  title: string;
  images: { nodes: Array<{ url: string }> };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    }
  };
  availableForSale: boolean;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistProducts: WishlistProduct[] = [];
  loading = true;
  currentUserId: number | null = null;

  private userSubscription?: Subscription;
  private wishlistSubscription?: Subscription;

  constructor(
    private wishlistService: WishlistService,
    private authService: AuthService,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.loadWishlist(user.id);
      } else {
        this.router.navigate(['/login']);
      }
    });

    // Listen to wishlist changes
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe(() => {
      if (this.currentUserId) {
        this.loadWishlist(this.currentUserId);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.wishlistSubscription?.unsubscribe();
  }

  loadWishlist(userId: number): void {
    this.loading = true;
    const productIds = this.wishlistService.getWishlistByUserId(userId);

    if (productIds.length === 0) {
      this.wishlistProducts = [];
      this.loading = false;
      return;
    }

    // Fetch all products from Shopify
    const productRequests = productIds.map(id => 
      this.productService.getProductById(id)
    );

    forkJoin(productRequests).subscribe({
      next: (results) => {
        this.wishlistProducts = results
          .map(result => result?.data?.product)
          .filter(product => product != null) as WishlistProduct[];
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load wishlist products:', error);
        this.loading = false;
      }
    });
  }

  removeFromWishlist(productId: string): void {
    if (!this.currentUserId) return;
    this.wishlistService.removeFromWishlist(this.currentUserId, productId);
  }

  addToCart(product: WishlistProduct): void {
    this.cartService.addToCart(product);
  }

  addAllToCart(): void {
    this.wishlistProducts.forEach(product => {
      this.cartService.addToCart(product);
    });
  }

  clearWishlist(): void {
    if (!this.currentUserId) return;
    
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      this.wishlistService.clearWishlist(this.currentUserId);
    }
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  formatPrice(amount: string, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  }

  getProductImage(product: WishlistProduct): string {
    return product?.images?.nodes?.[0]?.url || 'assets/placeholder.jpg';
  }
}
