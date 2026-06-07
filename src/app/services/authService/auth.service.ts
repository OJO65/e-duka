import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id:          string;
  username:    string;
  email:       string;
  phone?:      string;
  avatar_url?: string;
  orders?:     any[];
  wishlist?:   string[];
  createdAt?:  string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api         = environment.apiUrl;
  private readonly TOKEN_KEY   = 'gnet_access_token';
  private readonly REFRESH_KEY = 'gnet_refresh_token';
  private readonly USER_KEY    = 'gnet_user';

  private isLoggedInSubject  = new BehaviorSubject<boolean>(!!this.getToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());

  isLoggedIn$:  Observable<boolean>     = this.isLoggedInSubject.asObservable();
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.api}/auth/login`, { email, password })
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  register(username: string, email: string, password: string, phone?: string): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/register`, { username, email, password, phone });
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.api}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({ error: () => {} });
    }
    this.clearSession();
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.api}/auth/forgot-password`, { email });
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.api}/auth/me`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getAuthHeaders(): { Authorization: string } {
    return { Authorization: `Bearer ${this.getToken()}` };
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateUser(updates: Partial<User>): void {
    const current = this.currentUserSubject.value;
    if (!current) return;
    const updated = { ...current, ...updates };
    localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
    this.currentUserSubject.next(updated);
  }

  getDemoCredentials(): { email: string; password: string } {
    return { email: '', password: '' };
  }

  private handleAuthResponse(res: any): void {
    localStorage.setItem(this.TOKEN_KEY,   res.access_token);
    localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
    localStorage.setItem(this.USER_KEY,    JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
    this.isLoggedInSubject.next(true);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}