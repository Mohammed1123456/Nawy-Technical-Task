import { APIResponse } from '@playwright/test';
import { BaseApi } from '../base-api';

export interface Product {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
}

interface ProductsPage {
  data: Product[];
}

export class ProductsApi extends BaseApi {
  async search(query: string): Promise<APIResponse> {
    return this.request.get('/products/search', { params: { q: query } });
  }

  async getProductByName(name: string): Promise<Product> {
    const { data } = await this.parseBody<ProductsPage>(
      await this.search(name),
      200
    );
    const product = data.find(item => item.name === name);
    if (!product) {
      throw new Error(`Product "${name}" was not found via the search API`);
    }
    return product;
  }
}
