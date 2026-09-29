import { APIRequestContext } from '@playwright/test';
import { UsersApi } from './users/users-api';
import { ProductsApi } from './products/products-api';
import { CartsApi } from './carts/carts-api';
import { InvoicesApi } from './invoices/invoices-api';

export class ApisManager {
  readonly request: APIRequestContext;
  readonly usersApi: UsersApi;
  readonly productsApi: ProductsApi;
  readonly cartsApi: CartsApi;
  readonly invoicesApi: InvoicesApi;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.usersApi = new UsersApi(request);
    this.productsApi = new ProductsApi(request);
    this.cartsApi = new CartsApi(request);
    this.invoicesApi = new InvoicesApi(request);
  }

  async dispose(): Promise<void> {
    await this.request.dispose();
  }
}
