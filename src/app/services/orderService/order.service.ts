import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../authService/auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  createOrder(phone: string, deliveryAddress: { street: string; city: string; county: string }): Observable<any> {
    return this.http.post<any>(
      `${this.api}/orders`,
      { phone, delivery_address: deliveryAddress },
      { headers: this.headers() }
    );
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/orders`, { headers: this.headers() });
  }

  getOrderById(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/orders/${orderId}`, { headers: this.headers() });
  }

  getOrdersByUserId(_userId: any): any[] { return []; }
  getOrderCount(_userId: any): number { return 0; }
  getTotalSpent(_userId: any): number { return 0; }
  generateOrderId(): string { return `ORD-${Date.now()}`; }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }
}