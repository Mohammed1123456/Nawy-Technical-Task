import { test as base } from '@playwright/test';
import { PagesManager } from '../pages/pagesManager';
import { ApisManager } from '../apis/apisManager';
import { RegisteredUser } from '../apis/users/users-api';
import environmentData from '../data/environment/environment-data';
import { generateUser } from '../data/user/user-data';

type Fixtures = {
  pagesManager: PagesManager;
  apisManager: ApisManager;
  createAuthenticatedApis: (token: string) => Promise<ApisManager>;
  registeredUser: RegisteredUser;
  loggedInUser: RegisteredUser;
};

export const test = base.extend<Fixtures>({
  pagesManager: async ({ page }, use) => {
    await use(new PagesManager(page));
  },

  // Anonymous API client - used for public endpoints (register, products)
  apisManager: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: environmentData.apiUrl,
    });
    const apisManager = new ApisManager(request);
    await use(apisManager);
    await apisManager.dispose();
  },

  // Factory for API clients authenticated with a bearer token
  createAuthenticatedApis: async ({ playwright }, use) => {
    const created: ApisManager[] = [];
    await use(async (token: string) => {
      const request = await playwright.request.newContext({
        baseURL: environmentData.apiUrl,
        extraHTTPHeaders: { Authorization: `Bearer ${token}` },
      });
      const apisManager = new ApisManager(request);
      created.push(apisManager);
      return apisManager;
    });
    await Promise.all(created.map(apisManager => apisManager.dispose()));
  },

  // A brand-new user registered via API, for tests where registration is setup
  registeredUser: async ({ apisManager }, use) => {
    await use(await apisManager.usersApi.registerUser(generateUser()));
  },

  // A registered user already logged in via UI, for tests that start from an authenticated page
  loggedInUser: async ({ registeredUser, pagesManager }, use) => {
    const { loginPage, accountPage } = pagesManager;
    await loginPage.navigateToLogin();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await accountPage.verifyAccountPageIsDisplayed();
    await use(registeredUser);
  },
});

export { expect } from '@playwright/test';
