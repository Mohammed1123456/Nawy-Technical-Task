import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openUntilReady(
    open: () => Promise<unknown>,
    readyLocator: Locator
  ): Promise<void> {
    await expect(async () => {
      await open();
      await expect(readyLocator).toBeVisible({ timeout: 10000 });
    }).toPass({ timeout: 45000 });
  }

  async fillField(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  async clickWhenEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
    await locator.click();
  }
}
