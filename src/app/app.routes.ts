import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { CartComponent } from './pages/cart/cart.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { AccountComponent } from './pages/account/account.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { ServicesComponent } from './pages/services/services.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { CareersComponent } from './pages/careers/careers.component';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PaymentDeliveryComponent } from './pages/payment-delivery/payment-delivery.component';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback.component';
import { EmailVerifiedComponent } from './pages/email-verified/email-verified.component';
import { AdminCouponsComponent } from './pages/admin/admin-coupons/admin-coupons.component';
import { AdminOffersComponent } from './pages/admin/admin-offers/admin-offers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'cart', component: CartComponent },
  { path: 'product/:productId', component: ProductDetailComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'email-verified', component: EmailVerifiedComponent },
  

  { path: 'careers', component: CareersComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'contact', component: ContactComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'admin/coupons', component: AdminCouponsComponent, canActivate: [AdminGuard] },
  { path: 'admin/offers', component: AdminOffersComponent, canActivate: [AdminGuard] },
  { path: 'payment-delivery', component: PaymentDeliveryComponent },
  
  {
    path: 'order-confirmation/:id',
    component: OrderConfirmationComponent,
    canActivate: [AuthGuard],
  },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [AuthGuard] },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/admin/admin-overview/admin-overview.component').then(
            (m) => m.AdminOverviewComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/admin/admin-orders/admin-orders.component').then(
            (m) => m.AdminOrdersComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/admin/admin-products/admin-products.component').then(
            (m) => m.AdminProductsComponent,
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./pages/admin/admin-customers/admin-customers.component').then(
            (m) => m.AdminCustomersComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
