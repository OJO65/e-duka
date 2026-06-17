import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email:        string  = '';
  password:     string  = '';
  rememberMe:   boolean = false;
  errorMessage: string  = '';
  isLoading:    boolean = false;
  showPassword: boolean = false;
  returnUrl:    string  = '/';

  constructor(
    private router:      Router,
    private route:       ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.authService.isLoggedIn()) this.router.navigateByUrl(this.returnUrl);
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'Invalid email or password.';
      },
    });
  }

  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password'], { queryParams: { returnUrl: this.returnUrl } });
  }

  goToRegister(): void {
    this.router.navigate(['/register'], { queryParams: { returnUrl: this.returnUrl } });
  }

  goHome(): void { this.router.navigate(['/']); }

  fillDemoCredentials(): void {
    const demo    = this.authService.getDemoCredentials();
    this.email    = demo.email;
    this.password = demo.password;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}