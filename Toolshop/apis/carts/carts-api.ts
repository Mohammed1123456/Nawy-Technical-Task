import { APIResponse } from '@playwright/test';
import { BaseApi } from '../base-api';

export interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  product: { id: string; name: string };
}

export interface Cart {
  id: string;
  cart_items: CartItem[];
}

export class CartsApi extends BaseApi {
  async createCart(): Promise<APIResponse> {
    return this.request.post('/carts');
  }

  async addItem(
    cartId: string,
    productId: string,
    quantity: number
  ): Promise<APIResponse> {
    return this.request.post(`/carts/${cartId}`, {
      data: { product_id: productId, quantity },
    });
  }

  async getCart(cartId: string): Promise<APIResponse> {
    return this.request.get(`/carts/${cartId}`);
  }
}
