import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base-page';

export class ProductPage extends BasePage {
  readonly productName: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.getByTestId('product-name');
    this.quantityInput = page.getByTestId('quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
  }

  async verifyProductIsDisplayed(productName: string): Promise<void> {
    await this.page.waitForURL(/\/product\//);
    await expect(this.productName).toContainText(productName);
  }

  async addToCart(quantity: number): Promise<void> {
    await this.fillField(this.quantityInput, String(quantity));
    await this.clickWhenEnabled(this.addToCartButton);
  }
}
