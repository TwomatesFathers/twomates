import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PrintfulAPIService {
  private apiUrl = environment.apiUrl;
  private apiToken = environment.printfulApiToken;
  private isProduction = environment.production;

  constructor(private http: HttpClient) {}

  public get products(): Observable<any> {
    if (this.isProduction) {
      const url = `${this.apiUrl}/store/products`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
      };

      return this.http.get<any>(url, { headers });
    } else {
      return this.getLocalProducts();
    }
  }

  private getLocalProducts(): Observable<any> {
    return this.http.get<any>('assets/products.json');
  }
}
