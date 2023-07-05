import { Product } from './../interfaces/product.interface';
import { ProductResponse } from '../interfaces/product-detail.interface';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PrintfulAPIService {
  private apiUrl = environment.apiUrl;
  private apiToken = environment.printfulApiToken;
  private isProduction = environment.production;

  constructor(private http: HttpClient) {}

  public get products(): Observable<Product[]> {
    if (this.isProduction) {
      const url = `${this.apiUrl}/store/products`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`,
      };

      return this.http.get<Product[]>(url, { headers });
    } else {
      return this.getLocalProducts();
    }
  }

  private getLocalProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('assets/products.json');
  }

  public getProduct(id: number): Observable<ProductResponse> {
    if (this.isProduction) {
      const url = `${this.apiUrl}/store/products/${id}`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`,
      };

      return this.http.get<ProductResponse>(url, { headers });
    } else {
      return this.getLocalProduct(id);
    }
  }

  private getLocalProduct(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`assets/products/${id}.json`)
  }
}
