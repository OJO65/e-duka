import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private isBrowser: boolean;

  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  canActivate(): boolean {
    console.log('[AUTH GUARD] isBrowser:', this.isBrowser, '| isLoggedIn:', this.auth.isLoggedIn());

    if (!this.isBrowser) {
      console.log('[AUTH GUARD] SSR — allowing through');
      return true;
    }
    if (!this.auth.isLoggedIn()) {
      console.log('[AUTH GUARD] Not logged in — REDIRECTING to /login');
      this.router.navigate(['/login']);
      return false;
    }
    console.log('[AUTH GUARD] Logged in — allowing through');
    return true;
  }
}