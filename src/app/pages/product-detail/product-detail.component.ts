import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ProductDetailSkeletonComponent } from '../../components/product-detail-skeleton/product-detail-skeleton.component';
import { ProductService } from '../../services/productService/product.service';
import { CartService } from '../../services/cartService/cart.service';
import { AuthService } from '../../services/authService/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductDetailSkeletonComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  productId: string = '';
  product: any = null;
  loading: boolean = true;
  selectedImageIndex: number = 0;
  selectedVariant: any = null;
  quantity: number = 1;
  showToast: boolean = false;
  toastMessage: string = '';
  reviews: any[] = [];
  reviewsLoading = false;
  userReview: any = null;
  canReview = false;
  showReviewForm = false;
  newRating = 0;
  newComment = '';
  reviewSubmitting = false;
  reviewError = '';
  reviewSuccess = '';
  hoverRating = 0;

  private routeSubscription?: Subscription;
  private toastTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public authService: AuthService,
    private cartService: CartService,
    private meta: Meta,
    private titleService: Title,
    private http: HttpClient,

    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe((params) => {
      this.productId = params['productId'];
      this.loadProduct();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  loadProduct(): void {
    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (result: any) => {
        this.product = result.data.product;
        if (!this.product) {
          this.router.navigate(['/']);
          return;
        }
        this.loadReviews();
        this.checkCanReview();

        if (this.product?.variants?.nodes?.length) {
          this.selectedVariant = this.product.variants.nodes[0];
        }

        // Dynamic meta tags for SEO
        const price = Number(this.selectedVariant?.priceV2?.amount || 0);
        const formattedPrice =
          'KES ' +
          new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(price);
        const description = `Buy ${this.product.title} at GNET Computers Kenya. ${formattedPrice}. ${this.product.description?.slice(0, 100) || ''}`;

        this.titleService.setTitle(
          `${this.product.title} — GNET Computers Kenya`,
        );
        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({
          property: 'og:title',
          content: `${this.product.title} — GNET Computers Kenya`,
        });
        this.meta.updateTag({
          property: 'og:description',
          content: description,
        });
        this.meta.updateTag({
          property: 'og:image',
          content: this.product.images?.nodes?.[0]?.url || '',
        });

        // Structured data for Google Shopping
        if (isPlatformBrowser(this.platformId)) {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.text = JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: this.product.title,
            image: this.product.images?.nodes?.map((i: any) => i.url) || [],
            description: this.product.description,
            brand: { '@type': 'Brand', name: this.product.vendor },
            offers: {
              '@type': 'Offer',
              url: `https://gnet.co.ke/product/${this.productId}`,
              priceCurrency: 'KES',
              price: price,
              availability: this.product.availableForSale
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              seller: { '@type': 'Organization', name: 'GNET Computers' },
            },
          });
          document.head.appendChild(script);
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  selectVariant(variant: any): void {
    this.selectedVariant = variant;
    if (variant.image?.url) {
      const index = this.product.images.nodes.findIndex(
        (img: any) => img.url === variant.image.url,
      );
      if (index >= 0) this.selectedImageIndex = index;
    }
  }

  get selectedImage(): string {
    return this.product?.images?.nodes?.[this.selectedImageIndex]?.url || '';
  }

  get displayPrice(): string {
    const variant = this.selectedVariant || this.product?.variants?.nodes?.[0];
    if (!variant) return '';
    const amount = Number(variant.priceV2?.amount || 0);
    return (
      'KES ' +
      new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    );
  }

  formatPrice(variant: any): string {
    const amount = Number(variant?.priceV2?.amount || 0);
    return (
      'KES ' +
      new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    );
  }

  increaseQuantity(): void {
    this.quantity++;
  }
  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): boolean {
    if (!this.selectedVariant?.availableForSale) {
      this.showToastMessage('This product is currently unavailable');
      return false;
    }
    const cartProduct = {
      id: this.product.id,
      title: this.product.title,
      vendor: this.product.vendor,
      images: this.product.images,
      priceRange: {
        minVariantPrice: {
          amount: this.selectedVariant.priceV2.amount,
          currencyCode: this.selectedVariant.priceV2.currencyCode,
        },
      },
      availableForSale: this.selectedVariant.availableForSale,
      variants: { nodes: [this.selectedVariant] },
    };
    const added = this.cartService.addToCart(cartProduct, this.quantity);
    if (added) {
      this.showToastMessage(
        `${this.quantity} × ${this.product.title} added to cart!`,
      );
    }
    return added;
  }

  buyNow(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    const added = this.addToCart();
    if (added) {
      setTimeout(() => {
        this.router.navigate(['/cart']);
      }, 500);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = false;
    setTimeout(() => {
      this.showToast = true;
    });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }

  loadReviews(): void {
    this.reviewsLoading = true;
    this.http
      .get<any[]>(`${environment.apiUrl}/reviews/${this.productId}`)
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
          this.reviewsLoading = false;
          // Check if current user already reviewed
          const userId = this.authService.getCurrentUser()?.id;
          if (userId) {
            this.userReview = reviews.find((r) => r.user_id === userId) || null;
          }
        },
        error: () => {
          this.reviewsLoading = false;
        },
      });
  }

  checkCanReview(): void {
    if (!this.authService.isLoggedIn()) return;
    const token = this.authService.getToken();
    this.http
      .get<any[]>(`${environment.apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (orders) => {
          this.canReview = orders.some(
            (o) =>
              ['confirmed', 'shipped', 'delivered'].includes(o.status) &&
              o.order_items?.some(
                (item: any) => item.product_id === this.productId,
              ),
          );
        },
        error: () => {},
      });
  }

  submitReview(): void {
    if (!this.newRating) {
      this.reviewError = 'Please select a rating';
      return;
    }
    this.reviewSubmitting = true;
    this.reviewError = '';
    this.reviewSuccess = '';

    const token = this.authService.getToken();
    this.http
      .post<any>(
        `${environment.apiUrl}/reviews/${this.productId}`,
        { rating: this.newRating, comment: this.newComment },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .subscribe({
        next: () => {
          this.reviewSuccess = 'Review submitted successfully!';
          this.reviewSubmitting = false;
          this.showReviewForm = false;
          this.newRating = 0;
          this.newComment = '';
          this.loadReviews();
        },
        error: (err) => {
          this.reviewError = err?.error?.error || 'Failed to submit review';
          this.reviewSubmitting = false;
        },
      });
  }

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    return (
      Math.round(
        (this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviews.length) *
          10,
      ) / 10
    );
  }

  setRating(rating: number): void {
    this.newRating = rating;
  }
  setHover(rating: number): void {
    this.hoverRating = rating;
  }
  clearHover(): void {
    this.hoverRating = 0;
  }

  formatReviewDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
