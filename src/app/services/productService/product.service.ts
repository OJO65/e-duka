import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private mapProduct(p: any): any {
    return {
      id:               p.id,
      title:            p.title,
      handle:           p.handle,
      description:      p.description ?? '',
      vendor:           p.vendor ?? '',
      productType:      p.product_type ?? '',
      tags:             p.tags ?? [],
      availableForSale: p.available_for_sale ?? false,
      images: {
        nodes: (p.images ?? []).map((img: any) => ({
          url:     img.url,
          altText: img.alt_text ?? p.title,
        })),
      },
      variants: {
        nodes: (p.product_variants ?? []).map((v: any) => ({
          id:                v.id,
          title:             v.title,
          availableForSale:  v.available_for_sale,
          quantityAvailable: v.quantity_available,
          priceV2: {
            amount:       String(v.price),
            currencyCode: v.currency_code ?? 'KES',
          },
          selectedOptions: v.selected_options ?? [],
          image: null,
        })),
      },
      priceRange: {
        minVariantPrice: { amount: String(p.min_price), currencyCode: p.currency_code ?? 'KES' },
        maxVariantPrice: { amount: String(p.max_price), currencyCode: p.currency_code ?? 'KES' },
      },
      options: p.options ?? [],
    };
  }

  searchProducts(query: string): Observable<any> {
    const params = new HttpParams().set('q', query);
    return this.http.get<any>(`${this.api}/products/search`, { params })
      .pipe(map(res => ({
        data: { products: { nodes: (res.products ?? []).map((p: any) => this.mapProduct(p)) } }
      })));
  }

  getProductsByCollection(collectionId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/collections/${collectionId}/products`)
      .pipe(map(res => ({
        data: {
          collection: {
            id:          res.collection.id,
            title:       res.collection.title,
            description: res.collection.description ?? '',
            products: { nodes: (res.collection.products ?? []).map((p: any) => this.mapProduct(p)) },
          }
        }
      })));
  }

  getProductById(productId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/products/${productId}`)
      .pipe(map(res => ({
        data: { product: this.mapProduct(res.product) }
      })));
  }

  createShopifyCart(items: any[]): Observable<any> {
    return this.http.post<any>(`${this.api}/orders`, items)
      .pipe(map(res => ({
        data: {
          cartCreate: {
            cart: { id: res.order?.id, checkoutUrl: `/order-confirmation/${res.order?.id}` },
            userErrors: [],
          }
        }
      })));
  }
}