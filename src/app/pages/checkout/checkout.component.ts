import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cartService/cart.service';
import { ProductService } from '../../services/productService/product.service';
import { Cart, CartItem } from '../../models/cart.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart: Cart = {
    items: [],
    itemCount: 0,
    subtotal: 0,
    currency: 'USD',
  };

  loading: boolean = false;
  error: string = '';

  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;

      // Redirect to cart if empty
      if (cart.items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  formatPrice(price: number, currency?: string): string {
    const curr = currency || this.cart.currency || 'USD';

    let formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);

    if (curr === 'CAD') {
      formatted = formatted.replace(/^CA/, '');
    }

    return formatted;
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  async proceedToShopifyCheckout(): Promise<void> {
    if (this.cart.items.length === 0) {
      this.error = 'Your cart is empty';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Validate all cart items before checkout
      const validItems = [];
      const invalidItems = [];

      for (const item of this.cart.items) {
        try {
          // Verify product still exists and is available
          const result = await this.productService
            .getProductById(item.productId)
            .toPromise();

          if (result?.data?.product && result.data.product.availableForSale) {
            const variant =
              result.data.product.variants.nodes.find(
                (v: any) => v.id === item.variantId
              ) || result.data.product.variants.nodes[0];

            if (variant && variant.availableForSale) {
              // Use fresh variant data from API
              validItems.push({
                ...item,
                variantId: variant.id,
                availableForSale: variant.availableForSale,
              });
            } else {
              invalidItems.push(item);
            }
          } else {
            invalidItems.push(item);
          }
        } catch (error) {
          console.error(`Failed to validate product ${item.productId}:`, error);
          invalidItems.push(item);
        }
      }

      // Handle invalid items
      if (invalidItems.length > 0) {
        // Remove invalid items from cart
        for (const item of invalidItems) {
          this.cartService.removeFromCart(item.productId);
        }

        this.error = `${invalidItems.length} item(s) are no longer available and have been removed from your cart.`;
        this.loading = false;

        // If all items were invalid, redirect to cart
        if (validItems.length === 0) {
          setTimeout(() => {
            this.router.navigate(['/cart']);
          }, 2000);
        }
        return;
      }

      // Proceed with checkout using valid items
      const result = await this.productService
        .createShopifyCart(validItems)
        .toPromise();

      // Check for user errors from Shopify
      if (result?.data?.cartCreate?.userErrors?.length > 0) {
        const errors = result.data.cartCreate.userErrors
          .map((e: any) => e.message)
          .join(', ');
        throw new Error(errors);
      }

      const checkoutUrl = result?.data?.cartCreate?.cart?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error('Failed to create checkout URL');
      }

      // Clear local cart before redirecting
      this.cartService.clearCart();

      // Redirect to Shopify checkout
      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error('Checkout error:', error);

      // Provide more specific error messages
      if (error.message?.includes('Invalid id')) {
        this.error =
          'Some items in your cart are no longer available. Please refresh and try again.';
      } else {
        this.error =
          error.message || 'Failed to proceed to checkout. Please try again.';
      }

      this.loading = false;
    }
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }
}
