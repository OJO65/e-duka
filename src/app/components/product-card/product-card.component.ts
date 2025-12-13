import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: {
    title: string;
    images: { nodes: Array<{ url: string }> };
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      }
    }
  };

  imageLoaded: boolean = false;
  imageError: boolean = false;

  onImageLoad() {
    this.imageLoaded = true;
  }

  onImageError() {
    this.imageError = true;
    this.imageLoaded = false;
  }

  // Helper method to get the first image
  get productImage(): string {
    return this.product?.images?.nodes?.[0]?.url || 'assets/placeholder.jpg';
  }

  // Helper method to format price
  get formattedPrice(): string {
    const amount = this.product?.priceRange?.minVariantPrice?.amount || '0';
    const currency = this.product?.priceRange?.minVariantPrice?.currencyCode || 'USD';
    
    // Format based on currency
    if (currency === 'USD') {
      return `$${parseFloat(amount)}`;
    } else if (currency === 'KES') {
      return `KSh ${parseFloat(amount)}`;
    }
    return `${currency} ${parseFloat(amount)}`;
  }

  onAddToCart() {
    console.log('Add to cart:', this.product.title);
    // TODO: Implement cart functionality
  }

  onViewDetails() {
    console.log('View details:', this.product.title);
    // TODO: Navigate to product detail page
  }
}