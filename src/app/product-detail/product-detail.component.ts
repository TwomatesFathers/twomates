import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintfulAPIService } from '../printful/printful-api.service';
import { Product, ProductResponse } from '../interfaces/product-detail.interface';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;

  constructor(private route: ActivatedRoute, private printfulApi: PrintfulAPIService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.getProductById(params['id']);
    })
  }

  private getProductById(id: number): void {
    this.printfulApi.getProduct(id).subscribe({
      next: (data: ProductResponse) => {
        this.product = data.result
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
}
