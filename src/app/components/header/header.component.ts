import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cartService/cart.service';
import { SearchService } from '../../services/searchService/search.service';
import { AuthService, User } from '../../services/authService/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() searchEvent = new EventEmitter<string>();

  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  isMobileMenuOpen = false;
  isAccountMenuOpen = false;

  cartItemCount: number = 0;
  private cartSubscription?: Subscription;

  isLoggedIn: boolean = false;
  currentUser: User | null = null;

  // CRITICAL FIX: gates rendering of the account/login area until we have
  // the REAL auth state (post-hydration on client), preventing the
  // SSR-default "Sign In" button from ever being visibly painted when
  // the user is actually logged in.
  authResolved: boolean = false;

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private router: Router,
    private cartService: CartService,
    private searchService: SearchService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchQuery) => {
        this.searchService.setSearch(searchQuery);
      });

    this.cartSubscription = this.cartService.cart$.subscribe((cart) => {
      this.cartItemCount = cart.itemCount;
    });

    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn    = loggedIn;
      this.authResolved  = true; // flips true on the FIRST real emission
    });

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
    this.cartSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  toggleMobileMenu()  { this.isMobileMenuOpen  = !this.isMobileMenuOpen; }
  closeMobileMenu()   { this.isMobileMenuOpen  = false; }
  toggleAccountMenu() { this.isAccountMenuOpen = !this.isAccountMenuOpen; }
  closeAccountMenu()  { this.isAccountMenuOpen = false; }

  searchProducts() { this.searchEvent.emit(this.searchQuery.trim()); }
  onSearchInput()  { this.searchSubject.next(this.searchQuery.trim()); }
  clearSearch()    { this.searchQuery = ''; this.searchService.setSearch(''); }

  goHome()       { this.router.navigate(['/']); }
  goToCart()     { this.router.navigate(['/cart']); }
  goToLogin()    { this.closeAccountMenu(); this.router.navigate(['/login']); }
  goToRegister() { this.closeAccountMenu(); this.router.navigate(['/register']); }

  signOut() {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
      this.closeAccountMenu();
      this.router.navigate(['/']);
    }
  }
}