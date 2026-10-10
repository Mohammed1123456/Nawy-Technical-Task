import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base-page';

export class HomePage extends BasePage {
  readonly navMenu: Locator;
  readonly navSignIn: Locator;
  readonly navSignOut: Locator;
  readonly navCart: Locator;
  readonly cartQuantity: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchTerm: Locator;
  readonly productNames: Locator;

  constructor(page: Page) {
    super(page);
    this.navMenu = page.getByTestId('nav-menu');
    this.navSignIn = page.getByTestId('nav-sign-in');
    this.navSignOut = page.getByTestId('nav-sign-out');
    this.navCart = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.searchTerm = page.getByTestId('search-term');
    this.productNames = page.getByTestId('product-name');
  }

  async navigateToHome(): Promise<void> {
    await this.openUntilReady(() => this.page.goto('/'), this.searchInput);
  }

  async searchFor(term: string): Promise<void> {
    await this.fillField(this.searchInput, term);
    await this.clickWhenEnabled(this.searchButton);
    await expect(this.searchTerm).toHaveText(term);
  }

  async openProduct(productName: string): Promise<void> {
    await this.productNames
      .filter({ hasText: new RegExp(`^\\s*${productName}\\s*$`) })
      .click();
  }

  async navigateToCart(): Promise<void> {
    await this.clickWhenEnabled(this.navCart);
    await this.page.waitForURL(/\/checkout/);
  }

  async verifyLoggedInUser(fullName: string): Promise<void> {
    await expect(this.navMenu).toContainText(fullName);
    await expect(this.navSignIn).toBeHidden();
  }

  async signOut(): Promise<void> {
    await this.navMenu.click();
    await this.navSignOut.click();
  }

  async verifyLoggedOut(): Promise<void> {
    await expect(this.navSignIn).toBeVisible();
    await expect(this.navMenu).toBeHidden();
  }

  async verifyCartQuantity(quantity: number): Promise<void> {
    await expect(this.cartQuantity).toHaveText(String(quantity));
  }
}
