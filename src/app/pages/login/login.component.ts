import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  returnUrl: string = '/';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl);
    }
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

    setTimeout(() => {
      const result = this.authService.login(
        this.email,
        this.password,
        this.rememberMe
      );
      this.isLoading = false;

      if (result.success) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = result.message;
      }
    }, 500);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password'], {
      queryParams: { returnUrl: this.returnUrl },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register'], {
      queryParams: { returnUrl: this.returnUrl },
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  fillDemoCredentials(): void {
    const demo = this.authService.getDemoCredentials();
    this.email = demo.email;
    this.password = demo.password;
  }
}
