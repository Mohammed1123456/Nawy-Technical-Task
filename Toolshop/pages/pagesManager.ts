import { Page } from '@playwright/test';
import { LoginPage } from './login/login-page';
import { HomePage } from './home-page/home-page';
import { AccountPage } from './account/account-page';
import { CartPage } from './checkout/cart-page';
import { CheckoutPage } from './checkout/checkout-page';

export class PagesManager {
  readonly page: Page;
  readonly loginPage: LoginPage;
  readonly homePage: HomePage;
  readonly accountPage: AccountPage;
  readonly cartPage: CartPage;
  readonly checkoutPage: CheckoutPage;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
    this.homePage = new HomePage(page);
    this.accountPage = new AccountPage(page);
    this.cartPage = new CartPage(page);
    this.checkoutPage = new CheckoutPage(page);
  }

  // The UI keeps the JWT of the logged-in user in localStorage
  async getAuthToken(): Promise<string> {
    const token = await this.page.evaluate(() =>
      localStorage.getItem('auth-token')
    );
    if (!token) {
      throw new Error(
        'No auth-token found in localStorage - user is not logged in'
      );
    }
    return token;
  }

  // The UI resolves the active cart from sessionStorage, so a cart created
  // via the API has to be attached to the browser session to be checked out
  async attachCartToSession(cartId: string, quantity: number): Promise<void> {
    await this.page.evaluate(
      ({ id, qty }) => {
        sessionStorage.setItem('cart_id', id);
        sessionStorage.setItem('cart_quantity', String(qty));
      },
      { id: cartId, qty: quantity }
    );
    await this.homePage.openUntilReady(
      () => this.page.reload(),
      this.homePage.cartQuantity
    );
  }
}
