import { test, expect } from '../../fixtures/fixtures';
import { generateUser } from '../../data/user/user-data';
import checkoutData from '../../data/checkout/checkout-data';

test.describe('Checkout flow (API + UI)', () => {
  test.describe.configure({ timeout: 120000 });

  test('Registered user buys "Ear Protection" with cash on delivery and gets an invoice', async ({
    pagesManager,
    apisManager,
    createAuthenticatedApis,
  }) => {
    const { product, paymentMethod } = checkoutData;

    const user = await test.step('1. Create a user via API', async () => {
      return apisManager.usersApi.registerUser(generateUser());
    });

    const authApis =
      await test.step('2. Log in via UI using the same credentials', async () => {
        const { loginPage, accountPage, homePage } = pagesManager;
        await loginPage.navigateToLogin();
        await loginPage.login(user.email, user.password);

        await accountPage.verifyAccountPageIsDisplayed();
        await homePage.verifyLoggedInUser(
          `${user.first_name} ${user.last_name}`
        );

        const apis = await createAuthenticatedApis(
          await pagesManager.getAuthToken()
        );
        const me = await apis.usersApi.getCurrentUserProfile();
        expect(me.id).toBe(user.id);
        expect(me.email).toBe(user.email);
        return apis;
      });

    const cartId =
      await test.step(`3. Add "${product.name}" to cart via API`, async () => {
        const { id: productId } =
          await apisManager.productsApi.getProductByName(product.name);
        const cart = await authApis.cartsApi.createCartWithItem(
          productId,
          product.quantity
        );
        return cart.id;
      });

    const billingAddress =
      await test.step('4. Complete payment via UI (cash on delivery)', async () => {
        const { homePage, cartPage, checkoutPage } = pagesManager;
        await pagesManager.attachCartToSession(cartId, product.quantity);
        await homePage.verifyCartQuantity(product.quantity);

        await homePage.navigateToCart();
        await cartPage.verifyProductInCart(product.name, product.quantity);
        await cartPage.proceedToCheckout();

        await checkoutPage.proceedFromSignIn();

        const address = await apisManager.addressesApi.resolveBillingAddress(
          user.address.country,
          user.address.postal_code,
          user.address.house_number
        );
        await checkoutPage.fillBillingAddress(user.address);
        await checkoutPage.verifyBillingAddress(address);
        await checkoutPage.proceedFromBilling();

        await checkoutPage.selectPaymentMethod(paymentMethod);
        await checkoutPage.confirmPayment();
        await checkoutPage.verifyPaymentSuccessMessage(
          checkoutData.paymentSuccessMessage
        );
        return address;
      });

    await test.step('5. Create invoice via API', async () => {
      const invoice = await authApis.invoicesApi.createInvoiceForCart(
        cartId,
        billingAddress,
        paymentMethod
      );

      expect(invoice.id).toBeTruthy();
      expect(invoice.invoice_number).toMatch(checkoutData.invoiceNumberPattern);
      expect(invoice.user_id).toBe(user.id);
      expect(invoice).toMatchObject({
        billing_street: billingAddress.street,
        billing_city: billingAddress.city,
        billing_state: billingAddress.state,
        billing_country: billingAddress.country,
        billing_postal_code: billingAddress.postal_code,
      });

      const storedInvoice = await authApis.invoicesApi.getInvoiceById(
        invoice.id
      );
      expect(storedInvoice.invoice_number).toBe(invoice.invoice_number);
    });
  });
});
