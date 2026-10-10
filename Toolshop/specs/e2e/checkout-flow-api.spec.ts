import { test, expect } from '../../fixtures/fixtures';
import { generateUser } from '../../data/user/user-data';
import checkoutData from '../../data/checkout/checkout-data';

test.describe('Checkout flow (API only)', () => {
  test('Registered user buys "Ear Protection" with cash on delivery and gets an invoice', async ({
    apisManager,
    createAuthenticatedApis,
  }) => {
    const { product, paymentMethod } = checkoutData;
    const { usersApi, productsApi, addressesApi } = apisManager;

    const user = await usersApi.registerUser(generateUser());
    const token = await usersApi.loginUser(user.email, user.password);
    const authApis = await createAuthenticatedApis(token);

    const me = await authApis.usersApi.getCurrentUserProfile();
    expect(me.id).toBe(user.id);
    expect(me.email).toBe(user.email);

    const { id: productId } = await productsApi.getProductByName(product.name);
    const cart = await authApis.cartsApi.createCartWithItem(
      productId,
      product.quantity
    );

    const billingAddress = await addressesApi.resolveBillingAddress(
      user.address.country,
      user.address.postal_code,
      user.address.house_number
    );
    const invoice = await authApis.invoicesApi.createInvoiceForCart(
      cart.id,
      billingAddress,
      paymentMethod
    );

    expect(invoice.invoice_number).toMatch(checkoutData.invoiceNumberPattern);
    expect(invoice.user_id).toBe(user.id);
    expect(invoice).toMatchObject({
      billing_street: billingAddress.street,
      billing_city: billingAddress.city,
      billing_state: billingAddress.state,
      billing_country: billingAddress.country,
      billing_postal_code: billingAddress.postal_code,
    });

    const storedInvoice = await authApis.invoicesApi.getInvoiceById(invoice.id);
    expect(storedInvoice.invoice_number).toBe(invoice.invoice_number);
  });
});
