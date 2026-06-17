import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { OrderService } from '../../services/orderService/order.service';
import { WishlistService } from '../../services/wishlistService/wishlist.service';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription?: Subscription;
  private wishlistSubscription?: Subscription;

  loading = true;
  private ordersLoaded   = false;
  private wishlistLoaded = false;

  isEditMode = false;
  editedUsername = '';
  editedEmail = '';

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  orderCount = 0;
  wishlistCount = 0;
  memberSince = '';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser    = user;
        this.editedUsername = user.username;
        this.editedEmail    = user.email;
        this.memberSince    = this.formatDate(user.createdAt);

        this.loadOrderCount();
      }
    });

    this.wishlistSubscription = this.wishlistService.wishlistItems$.subscribe(items => {
      this.wishlistCount   = items?.length || 0;
      this.wishlistLoaded  = true;
      this.checkAllLoaded();
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.wishlistSubscription?.unsubscribe();
  }

  private loadOrderCount(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orderCount   = orders?.length || 0;
        this.ordersLoaded = true;
        this.checkAllLoaded();
      },
      error: () => {
        this.orderCount   = 0;
        this.ordersLoaded = true;
        this.checkAllLoaded();
      }
    });
  }

  private checkAllLoaded(): void {
    if (this.ordersLoaded && this.wishlistLoaded) {
      this.loading = false;
    }
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      this.editedUsername = this.currentUser?.username || '';
      this.editedEmail    = this.currentUser?.email || '';
      this.errorMessage   = '';
    }
    this.isEditMode = !this.isEditMode;
  }

  saveProfile(): void {
    this.errorMessage   = '';
    this.successMessage = '';

    if (!this.editedUsername || this.editedUsername.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters';
      return;
    }

    if (!this.isValidEmail(this.editedEmail)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      this.authService.updateUser({
        username: this.editedUsername,
        email: this.editedEmail
      });

      this.isLoading      = false;
      this.successMessage = 'Profile updated successfully!';
      this.isEditMode      = false;

      setTimeout(() => { this.successMessage = ''; }, 3000);
    }, 500);
  }

  goToForgotPassword(): void { this.router.navigate(['/forgot-password']); }
  goToOrders(): void { this.router.navigate(['/orders']); }
  goToWishlist(): void { this.router.navigate(['/wishlist']); }

  signOut(): void {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  private formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}