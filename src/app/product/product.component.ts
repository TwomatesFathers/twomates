import { Component, Input } from '@angular/core';
import { Product } from './product.interface'; // Replace with the actual path to your Product interface

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  @Input() product: Product = {} as Product;
}
