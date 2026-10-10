import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base-page';
import { UserAddress } from '../../apis/users/users-api';
import { BillingAddress } from '../../apis/addresses/addresses-api';

export class CheckoutPage extends BasePage {
  readonly alreadyLoggedInMessage: Locator;
  readonly proceedFromSignInButton: Locator;

  readonly countrySelect: Locator;
  readonly postalCodeInput: Locator;
  readonly houseNumberInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly proceedFromBillingButton: Locator;

  readonly paymentMethodSelect: Locator;
  readonly confirmButton: Locator;
  readonly paymentSuccessMessage: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.alreadyLoggedInMessage = page.getByText(/you are already logged in/i);
    this.proceedFromSignInButton = page.getByTestId('proceed-2');

    this.countrySelect = page.getByTestId('country');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.houseNumberInput = page.getByTestId('house_number');
    this.streetInput = page.getByTestId('street');
    this.cityInput = page.getByTestId('city');
    this.stateInput = page.getByTestId('state');
    this.proceedFromBillingButton = page.getByTestId('proceed-3');

    this.paymentMethodSelect = page.getByTestId('payment-method');
    this.confirmButton = page.getByTestId('finish');
    this.paymentSuccessMessage = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  async proceedFromSignIn(): Promise<void> {
    await expect(this.alreadyLoggedInMessage).toBeVisible();
    await this.clickWhenEnabled(this.proceedFromSignInButton);
  }

  async fillBillingAddress(
    address: Pick<UserAddress, 'country' | 'postal_code' | 'house_number'>
  ): Promise<void> {
    await this.selectOption(this.countrySelect, address.country);
    await this.fillField(this.postalCodeInput, address.postal_code);
    await this.fillField(this.houseNumberInput, address.house_number);
    await this.houseNumberInput.blur();
  }

  async verifyBillingAddress(expected: BillingAddress): Promise<void> {
    await expect(this.countrySelect).toHaveValue(expected.country);
    await expect(this.postalCodeInput).toHaveValue(expected.postal_code);
    await expect(this.streetInput).toHaveValue(expected.street);
    await expect(this.cityInput).toHaveValue(expected.city);
    await expect(this.stateInput).toHaveValue(expected.state);
  }

  async verifyBillingAddressIsAutofilled(): Promise<void> {
    await expect(this.streetInput).not.toHaveValue('');
    await expect(this.cityInput).not.toHaveValue('');
    await expect(this.stateInput).not.toHaveValue('');
  }

  async proceedFromBilling(): Promise<void> {
    await this.clickWhenEnabled(this.proceedFromBillingButton);
  }

  async selectPaymentMethod(paymentMethod: string): Promise<void> {
    await this.selectOption(this.paymentMethodSelect, paymentMethod);
  }

  async confirmPayment(): Promise<void> {
    await this.clickWhenEnabled(this.confirmButton);
  }

  async verifyPaymentSuccessMessage(message: string): Promise<void> {
    await expect(this.paymentSuccessMessage).toHaveText(message);
  }

  async confirmOrder(): Promise<void> {
    await this.clickWhenEnabled(this.confirmButton);
  }

  async verifyOrderConfirmation(pattern: RegExp): Promise<void> {
    await expect(this.orderConfirmation).toHaveText(pattern);
  }
}
