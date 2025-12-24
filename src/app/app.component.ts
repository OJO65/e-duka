import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SearchService } from './services/searchService/search.service';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/authService/auth.service';
import { CartService } from './services/cartService/cart.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'e-duka';
  products: any[] = [];
  loading: boolean = false;
  showProducts: boolean = false;
  
  isAuthPage: boolean = false;

  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private searchService: SearchService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Listen to authentication state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('User logged in:', user.username);
        this.cartService.mergeGuestCartIntoUser(user.id);
        this.cartService.setUser(user.id);
      } else {
        console.log('No user authenticated');
        this.cartService.setUser(null);
      }
    });

    // Listen to route changes to detect auth pages
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage = this.checkIfAuthPage(event.urlAfterRedirects);
    });

    // Check initial route
    this.isAuthPage = this.checkIfAuthPage(this.router.url);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  onSearch(query: string) {
    this.searchService.setSearch(query);
  }

  private checkIfAuthPage(url: string): boolean {
    return url.includes('/login') || url.includes('/register') || url.includes('/forgot-password');
  }
}