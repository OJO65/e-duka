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
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'home', component: HomeComponent},
    {path: 'shop', component: ShopComponent},
    {path: 'cart', component: CartComponent},
    {path: 'product/:productId', component: ProductDetailComponent},
    
    // Auth pages
    {path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    
    // Protected routes
    {path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard]},
    {path: 'account', component: AccountComponent, canActivate: [AuthGuard]},
    {path: 'order-confirmation/:id', component: OrderConfirmationComponent, canActivate: [AuthGuard]},  // ← ADD THIS
    // {path: 'orders', component: OrdersComponent, canActivate: [AuthGuard]},  // ← We'll add this when we build Orders page
    
    {path: '**', redirectTo: 'home' }
];
