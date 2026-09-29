import { test, expect } from '../../fixtures/fixtures';
import userData, { generateUser } from '../../data/user/user-data';

test.beforeEach(async ({ pagesManager }) => {
  await pagesManager.loginPage.navigateToLogin();
});

test.describe('Login', () => {
  test('User registered via API can log in via UI', async ({
    pagesManager,
    apisManager,
  }) => {
    const user = generateUser();
    await apisManager.usersApi.expectStatus(
      await apisManager.usersApi.register(user),
      201
    );

    await pagesManager.loginPage.login(user.email, user.password);
    await pagesManager.accountPage.verifyAccountPageIsDisplayed();
    await pagesManager.homePage.verifyLoggedInUser(
      `${user.first_name} ${user.last_name}`
    );
    expect(await pagesManager.getAuthToken()).toBeTruthy();
  });

  test('Login fails with invalid credentials', async ({
    pagesManager,
    page,
  }) => {
    const { email, password } = userData.invalidCredentials;
    await pagesManager.loginPage.login(email, password);

    await pagesManager.loginPage.verifyLoginErrorIsDisplayed(
      userData.invalidLoginMessage
    );
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.afterEach(async ({ pagesManager }) => {
  await pagesManager.close();
});
