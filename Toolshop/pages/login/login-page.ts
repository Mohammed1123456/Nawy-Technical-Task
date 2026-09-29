import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base-page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-submit');
    this.loginError = page.getByTestId('login-error');
  }

  async navigateToLogin(): Promise<void> {
    await this.page.goto('/auth/login');
    await this.waitElementToBeVisible(this.emailInput);
  }

  async enterEmailAndPassword(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    await this.loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmailAndPassword(email, password);
    await this.clickLoginButton();
  }

  async verifyLoginErrorIsDisplayed(message: string): Promise<void> {
    await expect(this.loginError).toContainText(message);
  }
}
