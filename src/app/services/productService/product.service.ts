import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from'../../../environments/environment';

// ─── Interfaces matching your existing component expectations ───────────────

export interface ProductImage {
  url: string;
  altText?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number;
  priceV2: { amount: string; currencyCode: string };
  selectedOptions?: { name: string; value: string }[];
  image?: { url: string };
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  vendor: string;
  productType?: string;
  tags: string[];
  availableForSale: boolean;
  images: { nodes: ProductImage[] };
  variants: { nodes: ProductVariant[] };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  options?: { id: string; name: string; values: string[] }[];
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image: { url: string } | null;
  products?: { nodes: Product[] };
}

// ─── Raw API shapes from your Medusa/custom REST backend ───────────────────

interface ApiProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  product_type: string;
  tags: string[];
  available_for_sale: boolean;
  images: { url: string; alt_text?: string }[];
  variants: {
    id: string;
    title: string;
    available_for_sale: boolean;
    quantity_available: number;
    price: number;
    currency_code: string;
    selected_options: { name: string; value: string }[];
    image_url?: string;
  }[];
  min_price: number;
  max_price: number;
  currency_code: string;
  options?: { id: string; name: string; values: string[] }[];
}

interface ApiCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image_url?: string;
  products?: ApiProduct[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── Map raw API product → shape your components already expect ─────────

  private mapProduct(p: ApiProduct): Product {
    const minPrice = p.min_price ?? p.variants?.[0]?.price ?? 0;
    const maxPrice = p.max_price ?? p.variants?.[0]?.price ?? 0;
    const currencyCode = p.currency_code ?? p.variants?.[0]?.currency_code ?? 'USD';

    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: p.description ?? '',
      vendor: p.vendor ?? '',
      productType: p.product_type ?? '',
      tags: p.tags ?? [],
      availableForSale: p.available_for_sale ?? false,
      images: {
        nodes: (p.images ?? []).map(img => ({
          url: img.url,
          altText: img.alt_text ?? p.title,
        })),
      },
      variants: {
        nodes: (p.variants ?? []).map(v => ({
          id: v.id,
          title: v.title,
          availableForSale: v.available_for_sale,
          quantityAvailable: v.quantity_available,
          priceV2: {
            amount: String(v.price),
            currencyCode: v.currency_code ?? currencyCode,
          },
          selectedOptions: v.selected_options ?? [],
          image: v.image_url ? { url: v.image_url } : undefined,
        })),
      },
      priceRange: {
        minVariantPrice: { amount: String(minPrice), currencyCode },
        maxVariantPrice: { amount: String(maxPrice), currencyCode },
      },
      options: p.options ?? [],
    };
  }

  private mapCollection(c: ApiCollection): Collection {
    return {
      id: c.id,
      title: c.title,
      handle: c.handle,
      description: c.description ?? '',
      image: c.image_url ? { url: c.image_url } : null,
      products: c.products
        ? { nodes: c.products.map(p => this.mapProduct(p)) }
        : undefined,
    };
  }

  // ─── Wrap response in { data: ... } so your components need zero changes ─

  /** Search products — replaces Shopify `products(query: $query)` */
  searchProducts(query: string): Observable<any> {
    const params = new HttpParams().set('q', query).set('limit', '20');
    return this.http
      .get<{ products: ApiProduct[] }>(`${this.baseUrl}/products/search`, { params })
      .pipe(
        map(res => ({
          data: { products: { nodes: (res.products ?? []).map(p => this.mapProduct(p)) } },
        }))
      );
  }

  /** Products in a category — replaces Shopify `collection(id)` */
  getProductsByCollection(collectionId: string): Observable<any> {
    return this.http
      .get<{ collection: ApiCollection }>(`${this.baseUrl}/collections/${collectionId}/products`)
      .pipe(
        map(res => ({
          data: { collection: this.mapCollection(res.collection) },
        }))
      );
  }

  /** Single product — replaces Shopify `product(id)` */
  getProductById(productId: string): Observable<any> {
    return this.http
      .get<{ product: ApiProduct }>(`${this.baseUrl}/products/${productId}`)
      .pipe(
        map(res => ({
          data: { product: this.mapProduct(res.product) },
        }))
      );
  }

  /**
   * Checkout — replaces Shopify `cartCreate` mutation.
   * Returns an Observable with { checkoutUrl } so cart.component.ts
   * can redirect the user to Stripe / your payment page.
   */
  createCheckout(items: { variantId: string; quantity: number }[]): Observable<any> {
    return this.http
      .post<{ checkout_url: string; order_id: string }>(
        `${this.baseUrl}/checkout`,
        { line_items: items }
      )
      .pipe(
        map(res => ({
          data: {
            cartCreate: {
              cart: {
                id: res.order_id,
                checkoutUrl: res.checkout_url,
              },
              userErrors: [],
            },
          },
        }))
      );
  }
}
