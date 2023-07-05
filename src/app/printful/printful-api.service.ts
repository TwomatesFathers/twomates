import { environment } from './../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintfulAPIService {
  private apiUrl = environment.apiUrl;
  private apiToken = environment.printfulApiToken;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiToken}`,
    });
  }

  public getProducts(): Observable<any> {
    const url = `${this.apiUrl}/store/products`; // Replace with the specific Printful API endpoint you want to access
    const headers = this.getHeaders();

    return this.http.get<any>(url, { headers });
  }
}
