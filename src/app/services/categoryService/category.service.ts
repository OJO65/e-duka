import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCollections(): Observable<any> {
    return this.http.get<any>(`${this.api}/collections`)
      .pipe(map(res => ({
        data: {
          collections: {
            nodes: (res.collections ?? []).map((c: any) => ({
              id:     c.id,
              title:  c.title,
              handle: c.handle,
              image:  c.image_url ? { url: c.image_url } : null,
            })),
          }
        }
      })));
  }
}