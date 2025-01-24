import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ServicesComponent } from './components/services/services.component';
import { BookingComponent } from './components/booking/booking.component';
import { ShopComponent } from './components/shop/shop.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProductDetailPageComponent } from './components/shop/product-detail-page/product-detail-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/product/:id', component: ProductDetailPageComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
