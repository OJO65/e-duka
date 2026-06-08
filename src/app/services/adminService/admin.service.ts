import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../authService/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getStats():     Observable<any> { return this.http.get(`${this.api}/admin/stats`,     { headers: this.headers() }); }
  getOrders():    Observable<any> { return this.http.get(`${this.api}/admin/orders`,    { headers: this.headers() }); }
  getProducts():  Observable<any> { return this.http.get(`${this.api}/admin/products`,  { headers: this.headers() }); }
  getCustomers(): Observable<any> { return this.http.get(`${this.api}/admin/customers`, { headers: this.headers() }); }

  updateOrderStatus(id: string, status: string, paymentStatus?: string): Observable<any> {
    const body: any = { status };
    if (paymentStatus) body.payment_status = paymentStatus;
    return this.http.patch(`${this.api}/admin/orders/${id}/status`, body, { headers: this.headers() });
  }

  updateProduct(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.api}/admin/products/${id}`, data, { headers: this.headers() });
  }

  updateStock(productId: string, variantId: string, qty: number): Observable<any> {
    return this.http.patch(`${this.api}/admin/products/${productId}/stock`,
      { variant_id: variantId, stock_qty: qty }, { headers: this.headers() });
  }
}