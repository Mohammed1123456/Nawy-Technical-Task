import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base-page';

export class AccountPage extends BasePage {
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByTestId('page-title');
  }

  async verifyAccountPageIsDisplayed(): Promise<void> {
    await this.page.waitForURL(/\/account$/);
    await expect(this.pageTitle).toHaveText('My account');
  }
}
