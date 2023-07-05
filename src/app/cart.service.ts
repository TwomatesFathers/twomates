// cart.service.ts
import { Injectable } from '@angular/core';
import { CartItem } from 'src/app/interfaces/cartItem.interface';
import { Product } from './interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartKey = 'myCart';

  constructor() {}

  getCartItems(): CartItem[] {
    const cartData = localStorage.getItem(this.cartKey);
    return cartData ? JSON.parse(cartData) : [];
  }

  addToCart(item: Product): void {
    const cartItems = this.getCartItems();
    const existingCartItem = cartItems.find((cartItem: CartItem) => cartItem.id === item.id)
    if (existingCartItem) {
      // If the item with the same id is found, append the quantity to it
      this.updateQuantity(existingCartItem.id, existingCartItem.quantity + 1)
    } else {
      cartItems.push( { ...item, quantity: 1 });
      localStorage.setItem(this.cartKey, JSON.stringify(cartItems));
    }
  }

  removeItem(itemId: number): void {
    const cartItems = this.getCartItems();
    const updatedItems = cartItems.filter((item: CartItem) => item.id !== itemId);
    this.updateCartItems(updatedItems);
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    const cartItems = this.getCartItems();
    const updatedItems = cartItems.map((item: any) => {
      if (item.id === itemId) {
        item.quantity = newQuantity;
      }
      return item;
    });
    this.updateCartItems(updatedItems);
  }

  private updateCartItems(items: any[]): void {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
  }
}
