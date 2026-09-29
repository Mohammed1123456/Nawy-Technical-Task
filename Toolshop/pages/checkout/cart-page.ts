import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base-page';

export class CartPage extends BasePage {
  readonly cartRows: Locator;
  readonly proceedToCheckoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('table tbody tr');
    this.proceedToCheckoutButton = page.getByTestId('proceed-1');
  }

  cartRow(productName: string): Locator {
    return this.cartRows.filter({
      has: this.page.getByTestId('product-title').getByText(productName),
    });
  }

  async verifyProductInCart(
    productName: string,
    quantity: number
  ): Promise<void> {
    const row = this.cartRow(productName);
    await expect(row).toHaveCount(1);
    await expect(row.getByTestId('product-quantity')).toHaveValue(
      String(quantity)
    );
  }

  async proceedToCheckout(): Promise<void> {
    await this.clickWhenEnabled(this.proceedToCheckoutButton);
  }
}
