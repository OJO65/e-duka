import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SearchService } from './services/searchService/search.service';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/authService/auth.service';
import { CartService } from './services/cartService/cart.service';
import { Subscription } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ConfirmModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title       = 'e-duka';
  isAuthPage  = false;
  isAdminPage = false;

  private authSubscription?:   Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private searchService: SearchService,
    private authService:   AuthService,
    private cartService:   CartService,
    private router:        Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$
      .pipe(skip(1))
      .subscribe(user => {
        if (user) this.cartService.setUser(user.id);
      });

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage  = this.checkIfAuthPage(event.urlAfterRedirects);
      this.isAdminPage = event.urlAfterRedirects.startsWith('/admin');
    });

    // Check initial route
    this.isAuthPage  = this.checkIfAuthPage(this.router.url);
    this.isAdminPage = this.router.url.startsWith('/admin');
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  onSearch(query: string) { this.searchService.setSearch(query); }

  private checkIfAuthPage(url: string): boolean {
    return url.includes('/login') ||
           url.includes('/register') ||
           url.includes('/forgot-password');
  }
}