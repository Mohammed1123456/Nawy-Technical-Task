import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base-page';
import { UserAddress } from '../../apis/users/users-api';

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export class CheckoutPage extends BasePage {
  // Sign in step
  readonly alreadyLoggedInMessage: Locator;
  readonly proceedFromSignInButton: Locator;

  // Billing address step
  readonly countrySelect: Locator;
  readonly postalCodeInput: Locator;
  readonly houseNumberInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly proceedFromBillingButton: Locator;

  // Payment step
  readonly paymentMethodSelect: Locator;
  readonly confirmButton: Locator;
  readonly paymentSuccessMessage: Locator;

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
  }

  async proceedFromSignIn(): Promise<void> {
    await expect(this.alreadyLoggedInMessage).toBeVisible();
    await this.clickWhenEnabled(this.proceedFromSignInButton);
  }

  // Entering country + postal code + house number triggers the app's postcode
  // lookup, which auto-fills street, city and state with the resolved address
  async fillBillingAddress(
    address: Pick<UserAddress, 'country' | 'postal_code' | 'house_number'>
  ): Promise<BillingAddress> {
    const lookupResponse = this.page.waitForResponse(
      response => {
        const url = new URL(response.url());
        return (
          url.pathname.endsWith('/postcode-lookup') &&
          url.searchParams.get('postcode') === address.postal_code &&
          url.searchParams.get('house_number') === address.house_number
        );
      },
      { timeout: 30000 }
    );

    await this.selectOption(this.countrySelect, address.country);
    await this.fillField(this.postalCodeInput, address.postal_code);
    await this.fillField(this.houseNumberInput, address.house_number);
    await this.houseNumberInput.blur();

    const response = await lookupResponse;
    expect(response.status(), 'postcode lookup failed').toBe(200);
    const resolved = (await response.json()) as BillingAddress;
    await expect(this.streetInput).toHaveValue(resolved.street);
    await expect(this.cityInput).toHaveValue(resolved.city);
    await expect(this.stateInput).toHaveValue(resolved.state);

    return this.getBillingAddress();
  }

  async getBillingAddress(): Promise<BillingAddress> {
    return {
      street: await this.streetInput.inputValue(),
      city: await this.cityInput.inputValue(),
      state: await this.stateInput.inputValue(),
      country: await this.countrySelect.inputValue(),
      postal_code: await this.postalCodeInput.inputValue(),
    };
  }

  async proceedFromBilling(): Promise<void> {
    await expect(this.proceedFromBillingButton).toBeEnabled();
    await this.proceedFromBillingButton.click();
  }

  async selectPaymentMethod(paymentMethod: string): Promise<void> {
    await this.selectOption(this.paymentMethodSelect, paymentMethod);
  }

  async confirmPayment(): Promise<void> {
    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
  }

  async verifyPaymentSuccessMessage(message: string): Promise<void> {
    await expect(this.paymentSuccessMessage).toHaveText(message);
  }
}
