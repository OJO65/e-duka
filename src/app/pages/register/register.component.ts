import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreeToTerms: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;
  returnUrl: string = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.authService.isLoggedIn()) this.router.navigate([this.returnUrl]);
  }

  onPasswordInput(): void {
    this.passwordStrength = this.calcStrength(this.password);
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.username ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    if (this.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters';
      return;
    }
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (!this.agreeToTerms) {
      this.errorMessage = 'Please agree to the Terms and Conditions';
      return;
    }

    this.isLoading = true;

    this.authService
      .register(this.username, this.email, this.password)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Account created! Logging you in...';
          this.authService.login(this.email, this.password).subscribe({
            next: () => this.router.navigate([this.returnUrl]),
            error: () => this.router.navigate(['/login']),
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err?.error?.error || 'Registration failed. Please try again.';
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.returnUrl },
    });
  }
  goHome(): void {
    this.router.navigate(['/']);
  }

  private isValidEmail(e: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  private calcStrength(p: string): 'weak' | 'medium' | 'strong' {
    if (p.length < 6) return 'weak';
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^a-zA-Z\d]/.test(p)) s++;
    return s <= 1 ? 'weak' : s <= 2 ? 'medium' : 'strong';
  }

  getPasswordStrengthColor(): string {
    const map: any = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-green-500',
    };
    return map[this.passwordStrength ?? ''] ?? 'bg-gray-300';
  }

  getPasswordStrengthWidth(): string {
    const map: any = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' };
    return map[this.passwordStrength ?? ''] ?? 'w-0';
  }

  signInWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }
}
