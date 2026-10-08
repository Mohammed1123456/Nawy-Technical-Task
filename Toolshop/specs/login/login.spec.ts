import { test, expect } from '../../fixtures/fixtures';
import userData from '../../data/user/user-data';

test.beforeEach(async ({ pagesManager }) => {
  await pagesManager.loginPage.navigateToLogin();
});

test.describe('Login', () => {
  test('User registered via API can log in via UI', async ({
    pagesManager,
    registeredUser,
  }) => {
    await pagesManager.loginPage.login(
      registeredUser.email,
      registeredUser.password
    );
    await pagesManager.accountPage.verifyAccountPageIsDisplayed();
    await pagesManager.homePage.verifyLoggedInUser(
      `${registeredUser.first_name} ${registeredUser.last_name}`
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
