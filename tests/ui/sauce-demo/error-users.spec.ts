import { test, expect, type Page } from '@playwright/test';
import { env } from '../../../src/utils/env';
import {
  CartLink,
  CheckoutCustomer,
  SauceProducts,
  SauceRoutes,
  SauceUsers,
  TitlesHeaders,
} from '../../../src/data/sauce-demo';

// performance_glitch_user's login is deliberately slow (BUG-001). This allowance applies
// only to that one assertion; the global expect timeout stays unchanged.
const GLITCH_LOGIN_TIMEOUT_MS = 10_000;

// Login budget: midway between standard_user (~0.5s) and performance_glitch_user (~5.1s),
// so network noise on the shared demo can't flip the result either way.
const LOGIN_BUDGET_MS = 2_500;

test.describe('Problem users', () => {
  const logIn = async (page: Page, username: string) => {
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(env.saucePassword);
    await page.getByRole('button', { name: 'Login' }).click();
  };

  test.beforeEach(async ({ page }) => {
    await page.goto(SauceRoutes.loginPage);
  });

  test(
    'performance glitch user can log in despite a slow response',
    { tag: '@regression' },
    async ({ page }) => {
      await test.step('user logs in and sees the products page', async () => {
        const loginStartedAt = Date.now();
        await logIn(page, SauceUsers.glitch);

        await expect(page).toHaveURL(SauceRoutes.productsMainPage);
        // The URL changes immediately; the products page is what renders slowly.
        await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.productHeader, {
          timeout: GLITCH_LOGIN_TIMEOUT_MS,
        });

        test.info().annotations.push({
          type: 'login-duration',
          description: `${String(Date.now() - loginStartedAt)} ms`,
        });
      });
    },
  );

  test(
    'performance glitch user sees the products page within the login budget',
    { tag: '@regression' },
    async ({ page }) => {
      test.fail(true, 'BUG-001 in docs/BUGS.md: products page takes ~5s to render after login');

      await test.step('products page renders within the budget after login', async () => {
        // Timed from before the click: Firefox and WebKit absorb the delay in the click
        // itself, Chromium in the next assertion, so an assertion timeout alone misses it.
        const loginStartedAt = Date.now();
        await logIn(page, SauceUsers.glitch);
        await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.productHeader, {
          timeout: GLITCH_LOGIN_TIMEOUT_MS,
        });

        expect(Date.now() - loginStartedAt).toBeLessThan(LOGIN_BUDGET_MS);
      });
    },
  );

  test(
    'problem user can enter a last name at checkout',
    { tag: '@regression' },
    async ({ page }) => {
      test.fail(true, 'BUG-002 in docs/BUGS.md: typing in Last Name overwrites First Name');

      await test.step('user logs in and opens checkout with one item', async () => {
        await logIn(page, SauceUsers.problem);
        await page
          .getByTestId('inventory-item')
          .filter({ hasText: SauceProducts.backpack })
          .getByRole('button', { name: 'Add to cart' })
          .click();
        await page.getByRole('button', { name: CartLink.anyCount }).click();
        await page.getByRole('button', { name: 'Checkout' }).click();

        await expect(page).toHaveURL(SauceRoutes.checkoutInfoPage);
      });

      await test.step('user fills in their information', async () => {
        await page.getByLabel('First Name').fill(CheckoutCustomer.firstName);
        await page.getByLabel('Last Name').fill(CheckoutCustomer.lastName);
        await page.getByLabel('Zip/Postal Code').fill(CheckoutCustomer.postalCode);
      });

      await test.step('every field keeps what the user typed', async () => {
        await expect(page.getByLabel('First Name')).toHaveValue(CheckoutCustomer.firstName);
        await expect(page.getByLabel('Last Name')).toHaveValue(CheckoutCustomer.lastName);
        await expect(page.getByLabel('Zip/Postal Code')).toHaveValue(CheckoutCustomer.postalCode);
      });
    },
  );
});
