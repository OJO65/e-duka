import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { CartComponent } from './pages/cart/cart.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';


export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'home', component: HomeComponent},
    {path: 'shop', component: ShopComponent},
    {path: 'cart', component: CartComponent},
    {path: 'product/:productId', component: ProductDetailComponent},
    {path: 'checkout', component: CheckoutComponent},
    {path: '**', redirectTo: 'home' }
];
