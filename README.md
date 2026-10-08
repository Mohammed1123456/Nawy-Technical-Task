# Practice Software Testing - Test Automation Framework

Playwright + TypeScript automation framework for [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (Toolshop).
It automates an end-to-end purchase flow that combines **API** and **UI** steps, sharing data (user, auth token, cart, billing address) between the two layers.

## End-to-End Flow

`Toolshop/specs/e2e/checkout-flow.spec.ts` runs the following steps as one test, each reported as a `test.step`:

| # | Step | Layer | Validations |
|---|------|-------|-------------|
| 1 | Create a user with a randomized, unique email | API `POST /users/register` | `201`, returned user data matches the request, `id` present, no password leaked |
| 2 | Log in with the same credentials | UI `/auth/login` | Redirect to `/account`, "My account" title, user name in the nav menu. **Session check:** the UI's `auth-token` authenticates `GET /users/me` as the same user |
| 3 | Add "Ear Protection" to cart | API `POST /carts`, `POST /carts/{id}` (authenticated with the UI session token) | `201` cart created, `200` + "item added or updated", `GET /carts/{id}` contains the product and quantity |
| 4 | Complete payment (Cash on Delivery) | UI `/checkout` | Cart shows the API-added product. The billing form auto-fills the same address the postcode-lookup API returns. Payment step shows "Payment was successful" |
| 5 | Create the invoice | API `POST /invoices` (the call the UI makes on the second "Confirm" click) | `201`, `invoice_number` matches `INV-<digits>`, invoice belongs to the registered user, billing address matches the address shown in the UI, `GET /invoices/{id}` returns the same invoice |

**How the layers are connected:**
- **API → UI:** the user created via API logs in via UI.
- **UI → API:** the JWT the UI stores in `localStorage` (`auth-token`) builds the authenticated API context.
- **API → UI:** the API-created cart is attached to the browser session (`sessionStorage.cart_id`), which is where the web app looks up the active cart.
- **API ↔ UI:** the billing address comes from the postcode-lookup API (`GET /postcode-lookup`). The test checks that the UI billing form shows the same address, then uses it for the invoice. The invoice API rejects addresses outside its postcode dataset, so this is required.

`Toolshop/specs/login/login.spec.ts` adds two independent tests: a positive login for an API-registered user, and a negative login with invalid credentials.

## Project Structure

The repository is a multi-module npm workspace. Each application under test is its own module with a self-contained Playwright project.

```
Practice-Software-Testing-TAF/
├── .github/workflows/
│   └── playwright-tests.yml        # CI: runs the suite on Chromium + Firefox, uploads reports
├── package.json                    # Workspace root + shortcut scripts
└── Toolshop/                       # Module for practicesoftwaretesting.com
    ├── apis/                       # API layer (API Object Model)
    │   ├── base-api.ts             # Shared status assertion / body parsing
    │   ├── apisManager.ts          # Single entry point exposing all API clients
    │   ├── users/users-api.ts
    │   ├── products/products-api.ts
    │   ├── carts/carts-api.ts
    │   ├── invoices/invoices-api.ts
    │   └── addresses/addresses-api.ts   # Postcode lookup
    ├── pages/                      # UI layer (Page Object Model)
    │   ├── base-page.ts            # Shared wait / fill / select helpers
    │   ├── pagesManager.ts         # Single entry point exposing all page objects + session helpers
    │   ├── login/login-page.ts
    │   ├── home-page/home-page.ts  # Header / navigation
    │   ├── account/account-page.ts
    │   └── checkout/
    │       ├── cart-page.ts        # Checkout step 1 - cart
    │       └── checkout-page.ts    # Checkout steps 2-4 - sign in, billing, payment
    ├── data/                       # Test data
    │   ├── environment/environment-data.ts   # URLs & execution settings (from .env)
    │   ├── user/user-data.ts                 # Randomized user generator (faker)
    │   └── checkout/checkout-data.ts         # Product, payment method, expected messages
    ├── fixtures/fixtures.ts        # Custom fixtures: pagesManager, apisManager, createAuthenticatedApis
    ├── specs/                      # Test specifications
    │   ├── e2e/checkout-flow.spec.ts
    │   └── login/login.spec.ts
    ├── playwright.config.ts        # Browsers, parallelism, reporters, screenshots
    ├── eslint.config.mjs           # Lint rules (TypeScript + Playwright best practices)
    ├── tsconfig.json
    └── .env.example
```

### Design notes
- **Page Object Model:** every screen is a class that extends `BasePage`. Locators are declared `readonly` and initialized in the constructor. Tests call page methods only, through `PagesManager`.
- **API Object Model:** the same pattern for the API. Each resource is a client that extends `BaseApi`, and tests use them through `ApisManager`.
- **Fixtures:**
  - `pagesManager` exposes all page objects.
  - `apisManager` is an anonymous API client.
  - `createAuthenticatedApis(token)` is a factory that creates bearer-authenticated API contexts and disposes of them automatically.
  - `registeredUser` registers a new user via API and returns the credentials plus the new user's `id`. Tests that only need a user as setup use it, such as the login spec.
- **Scenario state stays in the spec:** page objects and API clients don't store data between calls. Each `test.step` returns its output, such as the user, the cart id or the billing address, and the next step uses it as a typed `const`. Multi-call API sequences live in client helpers like `registerUser`, `createCartWithItem` and `createInvoiceForCart`, so the spec reads as the business flow.
- **Locators:** the app exposes `data-test` attributes, so `testIdAttribute` is set to `data-test` and locators use `getByTestId`. Role and text locators are used where no test id exists.
- **No hard-coded waits:** synchronization relies only on Playwright auto-waiting, web-first assertions (`toHaveValue`, `toBeEnabled`, `toBeVisible`) and `waitForURL`. There is no `waitForTimeout` anywhere, and ESLint enforces this.
- **Resilience to the public site:** the demo site sometimes fails to load a startup asset and shows a blank page. `BasePage.openUntilReady` retries the navigation (using `expect(...).toPass()`) until the page's key element is visible, so a bad page load doesn't fail the test.
- **Test data isolation:** each run registers a new user with a unique email (timestamp + random suffix), so tests are independent and safe to run in parallel. The product is looked up by name because the demo site resets its database and product IDs change.

## Prerequisites
- Node.js 18+ (20 recommended)
- npm 8+

## Installation

```bash
git clone <this-repo-url>
cd Practice-Software-Testing-TAF

# Install dependencies for all modules (npm workspaces)
npm install

# Install Playwright browsers (Chromium + Firefox)
npm run install:browsers
```

To also run on Microsoft Edge, install the Edge channel:

```bash
cd Toolshop && npm run install:edge
```

Optionally, copy `Toolshop/.env.example` to `Toolshop/.env` to override the URLs or run headed. All values have defaults, so this step isn't required.

## Running Tests Locally

From the repository root:

```bash
npm test                              # Toolshop suite on Chromium + Firefox
```

Or from inside `Toolshop/`:

```bash
cd Toolshop
npm test                              # all specs on Chromium + Firefox (in parallel)
npm run test:e2e                      # only the API + UI checkout flow
npm run test:login                    # only the login specs
npm run test:headed                   # watch the browser (Chromium)
npm run test:ui                       # Playwright UI mode
npx playwright test specs/e2e/checkout-flow.spec.ts --project=chromium   # single spec
```

## Running Tests in Different Browsers

Browsers are configured as Playwright projects in `Toolshop/playwright.config.ts`: `chromium`, `firefox` and `edge`.

```bash
cd Toolshop
npm run test:chromium                 # Chromium only
npm run test:firefox                  # Firefox only
npm run test:edge                     # Microsoft Edge (requires: npm run install:edge)
npm run test:all-browsers             # Chromium + Firefox + Edge
npx playwright test --project=chromium --project=firefox   # any combination
```

## Parallel Execution
- `fullyParallel: true`: every test, including the same test in different browsers, runs in its own worker.
- The default is **2 workers**, because the public demo site throttles bursts of traffic. Override it per run:

```bash
WORKERS=4 npm test
npx playwright test --workers=4
```

## Reports & Failure Artifacts
- **HTML report:** generated in `Toolshop/html-report/` on every run. Open it with:
  ```bash
  cd Toolshop && npm run report
  ```
- **Screenshots** are captured automatically on failure (`screenshot: 'only-on-failure'`), along with a **video** and a **trace** (`retain-on-failure`). All of them are attached to the failed test in the HTML report and stored under `Toolshop/test-results/`.
- **JUnit XML** is written to `Toolshop/test-results/results.xml` for CI integrations.

## Code Quality

```bash
cd Toolshop
npm run typecheck                     # strict TypeScript compile check
npm run lint                          # ESLint: typescript-eslint (type-aware) + eslint-plugin-playwright
npm run format                        # Prettier
```

The lint rules enforce the framework's conventions. For example, `playwright/no-wait-for-timeout` blocks hard-coded waits, `@typescript-eslint/no-floating-promises` catches a missing `await`, and `no-explicit-any` blocks untyped code.

## Continuous Integration
`.github/workflows/playwright-tests.yml` runs on every push/PR to `main` (and on demand). It typechecks and lints the code, then runs the suite in a Chromium and Firefox matrix and uploads the HTML report, plus screenshots, videos and traces on failure, as build artifacts. On CI, failed tests are retried once to absorb instability from the public demo site.
