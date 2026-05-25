import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiCollection {
  id: string;
  title: string;
  handle: string;
  image_url?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Replaces Shopify `collections(first: 10)` GraphQL query.
   * Wraps response in { data: { collections: { nodes: [...] } } }
   * so HomeComponent.loadCategories() needs zero changes.
   */
  getCollections(): Observable<any> {
    return this.http
      .get<{ collections: ApiCollection[] }>(`${this.baseUrl}/collections`)
      .pipe(
        map(res => ({
          data: {
            collections: {
              nodes: (res.collections ?? []).map(c => ({
                id: c.id,
                title: c.title,
                handle: c.handle,
                image: c.image_url ? { url: c.image_url } : null,
              })),
            },
          },
        }))
      );
  }
}
