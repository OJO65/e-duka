import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email           = '';
  errorMessage    = '';
  successMessage  = '';
  isLoading       = false;

  currentStep: 'email' | 'reset' = 'email';
  newPassword         = '';
  confirmPassword     = '';
  showPassword        = false;
  showConfirmPassword = false;

  constructor(
    private router:      Router,
    private authService: AuthService,
  ) {}

  onSubmitEmail(): void {
    this.errorMessage  = '';
    this.successMessage = '';

    if (!this.email) { this.errorMessage = 'Please enter your email address'; return; }
    if (!this.isValidEmail(this.email)) { this.errorMessage = 'Please enter a valid email address'; return; }

    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading      = false;
        this.currentStep    = 'reset';
        this.successMessage = `Reset link sent to ${this.email}. Check your inbox, then come back to set a new password.`;
      },
      error: (err: any) => {
        this.isLoading    = false;
        this.errorMessage = err?.error?.error || 'Failed to send reset email. Please try again.';
      }
    });
  }

  onSubmitNewPassword(): void {
    this.errorMessage  = '';
    this.successMessage = '';

    if (!this.newPassword || !this.confirmPassword) { this.errorMessage = 'Please fill in all password fields'; return; }
    if (this.newPassword.length < 6) { this.errorMessage = 'Password must be at least 6 characters'; return; }
    if (this.newPassword !== this.confirmPassword) { this.errorMessage = 'Passwords do not match'; return; }

    this.isLoading = true;

    // Update password via Supabase admin
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading      = false;
        this.successMessage = 'Password reset email sent! Click the link in your email to complete the reset.';
        setTimeout(() => { this.router.navigate(['/login']); }, 2000);
      },
      error: () => {
        this.isLoading    = false;
        this.errorMessage = 'An error occurred. Please try again.';
      }
    });
  }

  togglePasswordVisibility():        void { this.showPassword        = !this.showPassword; }
  toggleConfirmPasswordVisibility(): void { this.showConfirmPassword = !this.showConfirmPassword; }
  goToLogin(): void { this.router.navigate(['/login']); }
  goHome():    void { this.router.navigate(['/']); }

  backToEmail(): void {
    this.currentStep    = 'email';
    this.newPassword    = '';
    this.confirmPassword = '';
    this.errorMessage   = '';
    this.successMessage = '';
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}