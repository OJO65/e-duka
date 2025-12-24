import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  
  returnUrl: string = '/';

  // Password strength indicator
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // If already logged in, redirect
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onPasswordInput(): void {
    this.passwordStrength = this.calculatePasswordStrength(this.password);
  }

  onSubmit(): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate inputs
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
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

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
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

    // Simulate async registration
    setTimeout(() => {
      const result = this.authService.register(this.username, this.email, this.password);
      
      this.isLoading = false;

      if (result.success) {
        this.successMessage = 'Account created successfully! Redirecting...';
        
        // Redirect after 1 second
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      } else {
        this.errorMessage = result.message;
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
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: this.returnUrl } 
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (password.length < 6) return 'weak';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 1) return 'weak';
    if (strength <= 2) return 'medium';
    return 'strong';
  }

  getPasswordStrengthColor(): string {
    switch (this.passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  }

  getPasswordStrengthWidth(): string {
    switch (this.passwordStrength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  }
}
