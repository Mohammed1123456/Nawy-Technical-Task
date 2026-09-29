import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitElementToBeVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

  async fillField(locator: Locator, value: string): Promise<void> {
    await this.waitElementToBeVisible(locator);
    await locator.clear();
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await this.waitElementToBeVisible(locator);
    await locator.selectOption(value);
  }

  async clickWhenEnabled(locator: Locator): Promise<void> {
    await this.waitElementToBeVisible(locator);
    await locator.click();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
