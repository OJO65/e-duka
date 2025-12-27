import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  
  // Reset flow steps
  currentStep: 'email' | 'reset' = 'email';
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private router: Router) {}

  onSubmitEmail(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate email
    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;

    // Simulate checking if email exists
    setTimeout(() => {
      const users = this.getUsers();
      const userExists = users.find(
        u => u.email.toLowerCase() === this.email.toLowerCase()
      );

      this.isLoading = false;

      if (userExists) {
        // Move to password reset step
        this.currentStep = 'reset';
        this.successMessage = 'Email verified! Please enter your new password.';
      } else {
        this.errorMessage = 'No account found with this email address';
      }
    }, 500);
  }

  onSubmitNewPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate passwords
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all password fields';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    // Update password in localStorage
    setTimeout(() => {
      const users = this.getUsers();
      const userIndex = users.findIndex(
        u => u.email.toLowerCase() === this.email.toLowerCase()
      );

      if (userIndex !== -1) {
        users[userIndex].password = this.newPassword;
        this.saveUsers(users);

        this.isLoading = false;
        this.successMessage = 'Password reset successful! Redirecting to login...';

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
      }
    }, 500);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  backToEmail(): void {
    this.currentStep = 'email';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
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

  private saveUsers(users: any[]): void {
    localStorage.setItem('eduka_users', JSON.stringify(users));
  }
}