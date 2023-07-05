import { Component } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-cart',
  template: `
    <h2>Shopping Cart</h2>
    <ul>
      <li *ngFor="let item of cartItems">
        {{ item.name }} - Quantity: {{ item.quantity }}
        <button (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
        <button (click)="updateQuantity(item.id, item.quantity - 1)">-</button>
        <button (click)="removeItem(item.id)">Remove</button>
      </li>
    </ul>
  `,
})
export class CartComponent {
  cartItems: any[];

  constructor(private cartService: CartService) {
    this.cartItems = this.cartService.getCartItems();
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId);
    this.cartItems = this.cartService.getCartItems();
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    this.cartService.updateQuantity(itemId, newQuantity);
    this.cartItems = this.cartService.getCartItems();
  }
}
