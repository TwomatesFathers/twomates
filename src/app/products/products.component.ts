import { Component } from '@angular/core';
import { CartService } from '../cart.service';
import { Product } from 'src/shared/product.interface';

@Component({
  selector: 'app-products',
  template: `
    <!-- Product details and add to cart button -->
    <!-- products.component.html -->
    <h2>Products</h2>
    <ul>
        <li *ngFor="let product of products">
            <img class="product-image" [src]="product.imageUrl" alt="Product Image">
            <h3>{{ product.name }}</h3>
            <p>Price: {{ product.price }}</p>
            <!-- Add to cart button -->
            <button (click)="addToCart(product)">Add {{ product.name }} to Cart</button>
        </li>
    </ul>
  `,
})
export class ProductsComponent {
  products: Product[] = [{
    id: 1,
    name: 'TwoMates Original t-shirt (TM)',
    price: 7.99,
    imageUrl: '/assets/products/product_t_shirt.png',
  },
  {
    id: 2,
    name: 'TwoMates Party Bucket Hat (TM)',
    price: 77.99,
    imageUrl: '/assets/products/product_bucket_hat.png',
  }


    ];
  constructor(private cartService: CartService) {
    
  }

  addToCart(product: Product): void {

    this.cartService.addToCart(product);
  }
}