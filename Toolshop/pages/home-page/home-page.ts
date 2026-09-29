import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base-page';

export class HomePage extends BasePage {
  readonly navMenu: Locator;
  readonly navSignIn: Locator;
  readonly navCart: Locator;
  readonly cartQuantity: Locator;

  constructor(page: Page) {
    super(page);
    this.navMenu = page.getByTestId('nav-menu');
    this.navSignIn = page.getByTestId('nav-sign-in');
    this.navCart = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  async navigateToCart(): Promise<void> {
    await this.clickWhenEnabled(this.navCart);
    await this.page.waitForURL(/\/checkout/);
  }

  async verifyLoggedInUser(fullName: string): Promise<void> {
    await expect(this.navMenu).toContainText(fullName);
    await expect(this.navSignIn).toBeHidden();
  }

  async verifyCartQuantity(quantity: number): Promise<void> {
    await expect(this.cartQuantity).toHaveText(String(quantity));
  }
}
