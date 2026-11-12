import { test, expect } from '@playwright/test';
import {
  SauceUsers,
  InvalidData,
  ErrorMsgs,
  TitlesHeaders,
  SauceRoutes,
} from '../../../src/data/sauce-demo';
import { env } from '../../../src/utils/env';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can login with valid credentials', { tag: '@smoke' }, async ({ page }) => {
    await test.step('submit valid credentials', async () => {
      await page.getByLabel('Username').fill(SauceUsers.standard);
      await page.getByLabel('Password').fill(env.saucePassword);
      await page.getByRole('button', { name: 'Login' }).click();
    });

    await test.step('product page is shown', async () => {
      await expect(page).toHaveURL(SauceRoutes.productsMainPage);
      await expect(page).toHaveTitle(TitlesHeaders.mainTitle);
      await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.productHeader);
    });
  });

  test('login fails with an incorrect password', { tag: '@smoke' }, async ({ page }) => {
    await test.step('submit an incorrect password', async () => {
      await page.getByLabel('Username').fill(SauceUsers.standard);
      await page.getByLabel('Password').fill(InvalidData.incorrectPassWord);
      await page.getByRole('button', { name: 'Login' }).click();
    });

    await test.step('credentials error shown', async () => {
      await expect(page.getByTestId('error')).toHaveText(ErrorMsgs.invalidUserPassword);
    });

    await test.step('login page is displayed', async () => {
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });
  });

  test('locked out user cannot log in', { tag: '@regression' }, async ({ page }) => {
    await test.step('submit a locked-out user credentials', async () => {
      await page.getByLabel('Username').fill(SauceUsers.lockedOut);
      await page.getByLabel('Password').fill(env.saucePassword);
      await page.getByRole('button', { name: 'Login' }).click();
    });

    await test.step('locked-out error is shown', async () => {
      await expect(page.getByTestId('error')).toHaveText(ErrorMsgs.userLockedOut);
    });

    await test.step('login page is displayed', async () => {
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });
  });

  test('empty username shows error', { tag: '@regression' }, async ({ page }) => {
    await test.step('submit credentials with empty Username', async () => {
      await page.getByLabel('Password').fill(env.saucePassword);
      await page.getByRole('button', { name: 'Login' }).click();
    });

    await test.step('empty user error is shown', async () => {
      await expect(page.getByTestId('error')).toHaveText(ErrorMsgs.usernameRequired);
    });

    await test.step('login page is displayed', async () => {
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });
  });

  test('empty password shows error', { tag: '@regression' }, async ({ page }) => {
    await test.step('submit credentials with a empty password', async () => {
      await page.getByLabel('Username').fill(SauceUsers.standard);
      await page.getByRole('button', { name: 'Login' }).click();
    });

    await test.step('empty password error is shown', async () => {
      await expect(page.getByTestId('error')).toHaveText(ErrorMsgs.passwordRequired);
    });

    await test.step('login page is displayed', async () => {
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });
  });

  test('user can log out and return to login page', { tag: '@regression' }, async ({ page }) => {
    await test.step('submit valid credentials', async () => {
      await page.getByLabel('Username').fill(SauceUsers.standard);
      await page.getByLabel('Password').fill(env.saucePassword);
      await page.getByRole('button', { name: 'Login' }).click();
    });

    await test.step('click logout', async () => {
      await page.getByRole('button', { name: 'Open Menu' }).click();
      await page.getByRole('button', { name: 'Logout' }).click();
    });

    await test.step('login page is displayed', async () => {
      await expect(page).toHaveURL(SauceRoutes.loginPage);
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });
  });

  test('login fails with no credentials', { tag: '@regression' }, async ({ page }) => {
    await test.step('submit no credentials', async () => {
      await page.getByRole('button', { name: 'Login' }).click();
    });

    await test.step('empty username error is shown', async () => {
      await expect(page.getByTestId('error')).toHaveText(ErrorMsgs.usernameRequired);
    });

    await test.step('login page is displayed', async () => {
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });
  });
});
