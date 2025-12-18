import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cartService/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() product!: {
    title: string;
    images: { nodes: Array<{ url: string }> };
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode?: string; // optional for search products
      };
    };
  };

  imageLoaded: boolean = false;
  imageError: boolean = false;
  toastMessage: string = '';
  showToast: boolean = false;

  private toastTimeout: any;

  constructor(private cartService: CartService) {}

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

  // Robust, consistent price formatting for all products
  get formattedPrice(): string {
    const amount = Number(
      this.product?.priceRange?.minVariantPrice?.amount || 0
    );
    const currency =
      this.product?.priceRange?.minVariantPrice?.currencyCode || 'USD';

    // Intl.NumberFormat for proper currency symbol handling
    let formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    // Optional: strip country code prefix for CAD if you prefer just '$'
    if (currency === 'CAD') {
      formatted = formatted.replace(/^CA/, '');
    }

    return formatted;
  }

  onAddToCart() {
    this.cartService.addToCart(this.product);

    // Reset toast state
    this.toastMessage = `${this.product.title} added to cart`;
    this.showToast = false;

    // Force DOM re-render (important for animation)
    setTimeout(() => {
      this.showToast = true;
    });

    // Clear previous timer
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    // Start fresh timer
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 800);
  }

  onViewDetails() {
    console.log('View details:', this.product.title);
    // TODO: Navigate to product detail page
  }
}
