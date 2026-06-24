import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px;font-family:sans-serif;">
      <div style="width:40px;height:40px;border:3px solid #e5e7eb;border-top-color:#1a56db;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <p style="color:#6b7280;font-size:15px;">Signing you in...</p>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const params       = this.route.snapshot.queryParams;
    const accessToken  = params['access_token'];
    const refreshToken = params['refresh_token'];
    const error        = params['error'];

    if (error || !accessToken) {
      this.router.navigate(['/login'], { queryParams: { error: 'google_auth_failed' } });
      return;
    }

    // Fetch user profile using the new token
    this.http.get<any>(`${environment.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).subscribe({
      next: (user) => {
        // Store tokens and user exactly like normal login
        this.authService.handleGoogleCallback(accessToken, refreshToken, user);
        this.router.navigate(['/']);
      },
      error: () => {
        this.router.navigate(['/login'], { queryParams: { error: 'google_auth_failed' } });
      }
    });
  }
}