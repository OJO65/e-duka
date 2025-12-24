import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { CartComponent } from './pages/cart/cart.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';


export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'home', component: HomeComponent},
    {path: 'shop', component: ShopComponent},
    {path: 'cart', component: CartComponent},
    {path: 'product/:productId', component: ProductDetailComponent},
    {path: 'checkout', component: CheckoutComponent},
    {path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    {path: '**', redirectTo: 'home' }
];
