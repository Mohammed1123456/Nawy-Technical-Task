import { test, expect } from '../../fixtures/fixtures';
import { generateUser } from '../../data/user/user-data';
import checkoutData from '../../data/checkout/checkout-data';
import { UserResponse } from '../../apis/users/users-api';
import { Cart } from '../../apis/carts/carts-api';
import { InvoiceResponse } from '../../apis/invoices/invoices-api';

test.describe('Checkout flow (API + UI)', () => {
  test('Registered user buys "Ear Protection" with cash on delivery and gets an invoice', async ({
    pagesManager,
    apisManager,
    createAuthenticatedApis,
  }) => {
    const user = generateUser();
    const fullName = `${user.first_name} ${user.last_name}`;
    const { product, paymentMethod } = checkoutData;

    const registeredUser =
      await test.step('1. Create a user via API', async () => {
        const response = await apisManager.usersApi.register(user);
        const body = await apisManager.usersApi.parseBody<UserResponse>(
          response,
          201
        );

        expect(body.id).toBeTruthy();
        expect(body).toMatchObject({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          dob: user.dob,
        });
        expect(body.address).toMatchObject({
          street: user.address.street,
          city: user.address.city,
          country: user.address.country,
        });
        expect(body).not.toHaveProperty('password');
        return body;
      });

    const authApis =
      await test.step('2. Log in via UI using the same credentials', async () => {
        const { loginPage, accountPage, homePage } = pagesManager;
        await loginPage.navigateToLogin();
        await loginPage.login(user.email, user.password);

        await accountPage.verifyAccountPageIsDisplayed();
        await homePage.verifyLoggedInUser(fullName);

        // The session is established when the UI token authenticates the same user on the API
        const token = await pagesManager.getAuthToken();
        const apis = await createAuthenticatedApis(token);
        const me = await apis.usersApi.parseBody<UserResponse>(
          await apis.usersApi.getCurrentUser(),
          200
        );
        expect(me.id).toBe(registeredUser.id);
        expect(me.email).toBe(user.email);
        return apis;
      });

    const cartId =
      await test.step(`3. Add "${product.name}" to cart via API`, async () => {
        const productToAdd = await apisManager.productsApi.getProductByName(
          product.name
        );

        const cart = await authApis.cartsApi.parseBody<{ id: string }>(
          await authApis.cartsApi.createCart(),
          201
        );
        expect(cart.id).toBeTruthy();

        const addItemResponse = await authApis.cartsApi.addItem(
          cart.id,
          productToAdd.id,
          product.quantity
        );
        const addItemBody = await authApis.cartsApi.parseBody<{
          result: string;
        }>(addItemResponse, 200);
        expect(addItemBody.result).toBe(checkoutData.cartItemAddedMessage);

        const updatedCart = await authApis.cartsApi.parseBody<Cart>(
          await authApis.cartsApi.getCart(cart.id),
          200
        );
        expect(updatedCart.cart_items).toHaveLength(1);
        expect(updatedCart.cart_items[0]).toMatchObject({
          product_id: productToAdd.id,
          quantity: product.quantity,
        });
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

        const address = await checkoutPage.fillBillingAddress(user.address);
        await checkoutPage.proceedFromBilling();

        await checkoutPage.selectPaymentMethod(paymentMethod);
        await checkoutPage.confirmPayment();
        await checkoutPage.verifyPaymentSuccessMessage(
          checkoutData.paymentSuccessMessage
        );
        return address;
      });

    await test.step('5. Create invoice via API', async () => {
      const response = await authApis.invoicesApi.createInvoice({
        billing_street: billingAddress.street,
        billing_city: billingAddress.city,
        billing_state: billingAddress.state,
        billing_country: billingAddress.country,
        billing_postal_code: billingAddress.postal_code,
        payment_method: paymentMethod,
        payment_details: {},
        cart_id: cartId,
      });
      const invoice = await authApis.invoicesApi.parseBody<InvoiceResponse>(
        response,
        201
      );

      expect(invoice.id).toBeTruthy();
      expect(invoice.invoice_number).toMatch(checkoutData.invoiceNumberPattern);
      expect(invoice.user_id).toBe(registeredUser.id);
      expect(invoice).toMatchObject({
        billing_street: billingAddress.street,
        billing_city: billingAddress.city,
        billing_state: billingAddress.state,
        billing_country: billingAddress.country,
        billing_postal_code: billingAddress.postal_code,
      });

      const storedInvoice =
        await authApis.invoicesApi.parseBody<InvoiceResponse>(
          await authApis.invoicesApi.getInvoice(invoice.id),
          200
        );
      expect(storedInvoice.invoice_number).toBe(invoice.invoice_number);
    });
  });
});

test.afterEach(async ({ pagesManager }) => {
  await pagesManager.close();
});
