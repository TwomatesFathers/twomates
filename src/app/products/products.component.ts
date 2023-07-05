import { PrintfulAPIService } from './../printful/printful-api.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  constructor(private printfulApi: PrintfulAPIService) {}

  ngOnInit() {
    this.printfulApi.getProducts().subscribe(
      (data) => {
        // Handle the API response data here
        console.log(data);
      },
      (error) => {
        // Handle any errors that occur during the API call
        console.error(error);
      }
    );
  }

}
