import { test as base } from '@playwright/test';
import { PagesManager } from '../pages/pagesManager';
import { ApisManager } from '../apis/apisManager';
import environmentData from '../data/environment/environment-data';

type Fixtures = {
  pagesManager: PagesManager;
  apisManager: ApisManager;
  createAuthenticatedApis: (token: string) => Promise<ApisManager>;
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
});

export { expect } from '@playwright/test';
