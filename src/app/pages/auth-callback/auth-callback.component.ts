import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css'],
})
export class AuthCallbackComponent implements AfterViewInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const hash   = window.location.hash.substring(1);
      const search = window.location.search.substring(1);

      // Try fragment first, then query params as fallback
      const params = new URLSearchParams(hash || search);

      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken) {
        this.router.navigate(['/login'], { queryParams: { error: 'google_auth_failed' } });
        return;
      }

      this.http.get<any>(`${environment.apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      }).subscribe({
        next: (user) => {
          this.authService.handleGoogleCallback(accessToken, refreshToken ?? '', user);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.router.navigate(['/login'], { queryParams: { error: 'google_auth_failed' } });
        }
      });
    }, 100);
  }
}