import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { PrintfulAPIService } from './printful/printful-api.service';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    HomeComponent,
    CartComponent,
    ProductDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [
    PrintfulAPIService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
