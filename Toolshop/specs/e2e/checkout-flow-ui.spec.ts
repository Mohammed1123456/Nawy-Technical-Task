import { test } from '../../fixtures/fixtures';
import { generateUser } from '../../data/user/user-data';
import checkoutData from '../../data/checkout/checkout-data';

test.describe('Checkout flow (UI only)', () => {
  test.describe.configure({ timeout: 120000 });

  test('New user registers, buys "Ear Protection" with cash on delivery and gets an invoice', async ({
    pagesManager,
  }) => {
    const user = generateUser();
    const { product, paymentMethod } = checkoutData;
    const {
      registerPage,
      loginPage,
      accountPage,
      homePage,
      productPage,
      cartPage,
      checkoutPage,
    } = pagesManager;

    await registerPage.navigateToRegister();
    await registerPage.register(user);
    await loginPage.verifyLoginPageIsDisplayed();

    await loginPage.login(user.email, user.password);
    await accountPage.verifyAccountPageIsDisplayed();
    await homePage.verifyLoggedInUser(`${user.first_name} ${user.last_name}`);

    await homePage.navigateToHome();
    await homePage.searchFor(product.name);
    await homePage.openProduct(product.name);
    await productPage.verifyProductIsDisplayed(product.name);
    await productPage.addToCart(product.quantity);
    await homePage.verifyCartQuantity(product.quantity);

    await homePage.navigateToCart();
    await cartPage.verifyProductInCart(product.name, product.quantity);
    await cartPage.proceedToCheckout();
    await checkoutPage.proceedFromSignIn();

    await checkoutPage.fillBillingAddress(user.address);
    await checkoutPage.verifyBillingAddressIsAutofilled();
    await checkoutPage.proceedFromBilling();

    await checkoutPage.selectPaymentMethod(paymentMethod);
    await checkoutPage.confirmPayment();
    await checkoutPage.verifyPaymentSuccessMessage(
      checkoutData.paymentSuccessMessage
    );
    await checkoutPage.confirmOrder();
    await checkoutPage.verifyOrderConfirmation(
      checkoutData.orderConfirmationPattern
    );
  });
});
