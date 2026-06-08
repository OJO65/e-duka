import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private auth:   AuthService,
    private router: Router,
    private http:   HttpClient,
  ) {}

  canActivate() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    return this.http.get<any>(`${environment.apiUrl}/admin/stats`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` })
    }).pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}