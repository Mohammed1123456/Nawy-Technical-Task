import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base-page';
import { RegisterUserRequest } from '../../apis/users/users-api';

export class RegisterPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dobInput: Locator;
  readonly countrySelect: Locator;
  readonly postalCodeInput: Locator;
  readonly houseNumberInput: Locator;
  readonly streetInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('first-name');
    this.lastNameInput = page.getByTestId('last-name');
    this.dobInput = page.getByTestId('dob');
    this.countrySelect = page.getByTestId('country');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.houseNumberInput = page.getByTestId('house_number');
    this.streetInput = page.getByTestId('street');
    this.phoneInput = page.getByTestId('phone');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.registerButton = page.getByTestId('register-submit');
  }

  async navigateToRegister(): Promise<void> {
    await this.openUntilReady(
      () => this.page.goto('/auth/register'),
      this.registerButton
    );
  }

  async register(user: RegisterUserRequest): Promise<void> {
    await this.fillField(this.firstNameInput, user.first_name);
    await this.fillField(this.lastNameInput, user.last_name);
    await this.fillField(this.dobInput, user.dob);
    await this.selectOption(this.countrySelect, user.address.country);
    await this.fillField(this.postalCodeInput, user.address.postal_code);
    await this.fillField(this.houseNumberInput, user.address.house_number);
    await this.houseNumberInput.blur();
    await expect(this.streetInput).not.toHaveValue('');
    await this.fillField(this.phoneInput, user.phone);
    await this.fillField(this.emailInput, user.email);
    await this.fillField(this.passwordInput, user.password);
    await this.clickWhenEnabled(this.registerButton);
  }
}
