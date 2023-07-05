import { Component } from '@angular/core';
import { CartService } from '../cart.service';
import { CartItem } from '../interfaces/cartItem.interface';

@Component({
  selector: 'app-cart',
  template: `
    <body> 
    <h2>Shopping Cart</h2>
    <ul>
      <li *ngFor="let item of cartItems">
        {{ item.name }} - Quantity: {{ item.quantity }}
        <button (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
        <button (click)="updateQuantity(item.id, item.quantity - 1)">-</button>
        <button (click)="removeItem(item.id)">Remove</button>
      </li>
    </ul>
    <button routerLink="/order" class="router-link-button"> Proceed to checkout</button>
</body>
  `,
})
export class CartComponent {
  cartItems: CartItem[];

  constructor(private cartService: CartService) {
    this.cartItems = this.cartService.getCartItems();
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId);
    this.cartItems = this.cartService.getCartItems();
  }

  goToOrder(): void {

  }

  updateQuantity(itemId: number, newQuantity: number): void {
    this.cartService.updateQuantity(itemId, newQuantity);
    this.cartItems = this.cartService.getCartItems();
  }
}
