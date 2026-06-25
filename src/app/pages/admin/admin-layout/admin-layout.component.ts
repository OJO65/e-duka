import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/authService/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit {
  currentRoute = '';
  sidebarOpen = true;
  mobileSidebarOpen = false;
  currentUser: any;
  navItems = [
    { label: 'Overview', path: '/admin/overview', icon: 'grid' },
    { label: 'Orders', path: '/admin/orders', icon: 'orders' },
    { label: 'Products', path: '/admin/products', icon: 'box' },
    { label: 'Customers', path: '/admin/customers', icon: 'users' },
    { label: 'Coupons', path: '/admin/coupons', icon: 'tag' },
  ];
  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}
  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentRoute = e.url;
        this.mobileSidebarOpen = false; // auto-close on navigation
      });
  }
  isActive(path: string): boolean {
    return this.currentRoute.startsWith(path);
  }
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }
  goToStore(): void {
    this.router.navigate(['/home']);
  }
  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
