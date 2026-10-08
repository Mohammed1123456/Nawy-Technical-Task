import { APIResponse, expect } from '@playwright/test';
import { BaseApi } from '../base-api';

const ITEM_ADDED_MESSAGE = 'item added or updated';

export interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  product: { id: string; name: string };
}

export interface CreateCartResponse {
  id: string;
}

export interface AddCartItemResponse {
  result: string;
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

  async createCartWithItem(productId: string, quantity: number): Promise<Cart> {
    const { id: cartId } = await this.parseBody<CreateCartResponse>(
      await this.createCart(),
      201
    );
    expect(cartId).toBeTruthy();

    const { result } = await this.parseBody<AddCartItemResponse>(
      await this.addItem(cartId, productId, quantity),
      200
    );
    expect(result).toBe(ITEM_ADDED_MESSAGE);

    const cart = await this.parseBody<Cart>(await this.getCart(cartId), 200);
    expect(cart.cart_items).toHaveLength(1);
    expect(cart.cart_items[0]).toMatchObject({
      product_id: productId,
      quantity,
    });
    return cart;
  }
}
