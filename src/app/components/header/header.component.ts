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
import { Router } from '@angular/router';
import { CartService } from '../../services/cartService/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule],
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

  constructor(private router: Router, private cartService: CartService) {}

  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchQuery) => {
        this.searchEvent.emit(searchQuery);
      });
      this.cartSubscription = this.cartService.cart$.subscribe(cart => {
        this.cartItemCount = cart.itemCount;
      })
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
    this.cartSubscription?.unsubscribe();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleAccountMenu() {
    this.isAccountMenuOpen = !this.isAccountMenuOpen;
  }

  searchProducts() {
    this.searchEvent.emit(this.searchQuery.trim());
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery.trim());
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchEvent.emit('');
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
