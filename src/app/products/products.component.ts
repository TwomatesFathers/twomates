import { Component, OnInit } from '@angular/core';
import { PrintfulAPIService } from '../printful/printful-api.service';
import { Product } from '../interfaces/product.interface';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
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
