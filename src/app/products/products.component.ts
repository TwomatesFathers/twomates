import { Component, OnInit } from '@angular/core';
import { PrintfulAPIService } from '../printful/printful-api.service';
import { Product } from '../interfaces/product.interface';

@Component({
  selector: 'app-products',
  template: `
    <!-- Product details and add to cart button -->
    <!-- products.component.html -->
    <h2>Products</h2>
    <ul>
        <li *ngFor="let product of products">
            <h3>{{ product.name }}</h3>
            <p>Price: {{ product.price }}</p>
            <!-- Add to cart button -->
            <button (click)="addToCart(product)">Add {{ product.name }} to Cart</button>
        </li>
    </ul>
  `,
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];

  constructor(private printfulApi: PrintfulAPIService) {}

  ngOnInit() {
    this.getProducts();
  }

  private getProducts(): void {
    this.printfulApi.products.subscribe(
      (data: any) => {
        this.products = data.result;
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
