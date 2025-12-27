import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
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

  // Edit mode
  isEditMode = false;
  editedUsername = '';
  editedEmail = '';
  
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  // Stats
  orderCount = 0;
  wishlistCount = 0;
  memberSince = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.editedUsername = user.username;
        this.editedEmail = user.email;
        
        // Calculate stats
        this.orderCount = user.orders?.length || 0;
        this.wishlistCount = user.wishlist?.length || 0;
        this.memberSince = this.formatDate(user.createdAt);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      // Cancel edit - reset values
      this.editedUsername = this.currentUser?.username || '';
      this.editedEmail = this.currentUser?.email || '';
      this.errorMessage = '';
    }
    this.isEditMode = !this.isEditMode;
  }

  saveProfile(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate
    if (!this.editedUsername || this.editedUsername.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters';
      return;
    }

    if (!this.isValidEmail(this.editedEmail)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Check if email already exists (for other users)
    const users = this.getUsers();
    const emailExists = users.some(
      u => u.email.toLowerCase() === this.editedEmail.toLowerCase() && 
      u.id !== this.currentUser?.id
    );

    if (emailExists) {
      this.errorMessage = 'This email is already in use by another account';
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      // Update user
      this.authService.updateUser({
        username: this.editedUsername,
        email: this.editedEmail
      });

      this.isLoading = false;
      this.successMessage = 'Profile updated successfully!';
      this.isEditMode = false;

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 500);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  signOut(): void {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  private formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getUsers(): any[] {
    try {
      const users = localStorage.getItem('eduka_users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }
}