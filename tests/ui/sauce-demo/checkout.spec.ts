import { test, expect, type Page } from '@playwright/test';
import {
  SauceProducts,
  SauceRoutes,
  SauceUsers,
  TitlesHeaders,
} from '../../../src/data/sauce-demo';
import { env } from '../../../src/utils/env';

test.describe('Checkout', () => {
  const productCard = (page: Page, name: string) =>
    page.getByTestId('inventory-item').filter({ hasText: name });

  test.beforeEach(async ({ page }) => {
    await page.goto(SauceRoutes.loginPage);
    await page.getByLabel('Username').fill(SauceUsers.standard);
    await page.getByLabel('Password').fill(env.saucePassword);
    await page.getByRole('button', { name: 'Login' }).click();
  });

  test('checkout button opens the your information step', { tag: '@smoke' }, async ({ page }) => {
    await test.step('add a product and validate cart badge is 1', async () => {
      await productCard(page, SauceProducts.backpack)
        .getByRole('button', { name: 'Add to cart' })
        .click();

      await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    });

    await test.step('cart link opens the cart', async () => {
      await page.getByTestId('shopping-cart-link').click();

      await expect(page).toHaveURL(SauceRoutes.cartPage);
      await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.cartHeader);
    });

    await test.step('checkout button opens step 1', async () => {
      await page.getByRole('button', { name: 'Checkout' }).click();

      await expect(page).toHaveURL(SauceRoutes.checkoutInfoPage);
      await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.checkoutInfoHeader);
    });
  });
});
