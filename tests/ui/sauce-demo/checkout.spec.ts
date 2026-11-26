import { test, expect, type Page } from '@playwright/test';
import {
  CartLink,
  SauceBackPackPriceSummary,
  SauceProducts,
  SauceRoutes,
  SauceUsers,
  TitlesHeaders,
} from '../../../src/data/sauce-demo';
import { env } from '../../../src/utils/env';

test.describe('Checkout', () => {
  const productCard = (page: Page, name: string) =>
    page.getByTestId('inventory-item').filter({ hasText: name });

  const cartLink = (page: Page) => page.getByRole('button', { name: CartLink.anyCount });

  const toCents = (label: string | null): number => {
    const amount = label?.split('$')[1];
    if (amount === undefined) {
      throw new Error(`No dollar amount found in "${label ?? '<no text>'}"`);
    }
    return Math.round(Number(amount) * 100);
  };

  const readPriceSummary = async (page: Page) => ({
    subTotal: toCents(await page.getByTestId('subtotal-label').textContent()),
    tax: toCents(await page.getByTestId('tax-label').textContent()),
    total: toCents(await page.getByTestId('total-label').textContent()),
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(SauceRoutes.loginPage);
    await page.getByLabel('Username').fill(SauceUsers.standard);
    await page.getByLabel('Password').fill(env.saucePassword);
    await page.getByRole('button', { name: 'Login' }).click();
  });

  test('checkout button opens the your information step', { tag: '@smoke' }, async ({ page }) => {
    await test.step('add a product and the cart reports 1 item', async () => {
      await productCard(page, SauceProducts.backpack)
        .getByRole('button', { name: 'Add to cart' })
        .click();

      await expect(cartLink(page)).toHaveAccessibleName(CartLink.oneItem);
    });

    await test.step('cart link opens the cart', async () => {
      await cartLink(page).click();

      await expect(page).toHaveURL(SauceRoutes.cartPage);
      await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.cartHeader);
    });

    await test.step('checkout button opens step 1', async () => {
      await page.getByRole('button', { name: 'Checkout' }).click();

      await expect(page).toHaveURL(SauceRoutes.checkoutInfoPage);
      await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.checkoutInfoHeader);
    });
  });

  test(
    'checkout overview total equals item total plus tax',
    { tag: '@regression' },
    async ({ page }) => {
      await test.step('add the backpack and the cart reports 1 item', async () => {
        await productCard(page, SauceProducts.backpack)
          .getByRole('button', { name: 'Add to cart' })
          .click();
        await expect(cartLink(page)).toHaveAccessibleName(CartLink.oneItem);
      });

      await test.step('cart link opens cart', async () => {
        await cartLink(page).click();
        await expect(page).toHaveURL(SauceRoutes.cartPage);
        await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.cartHeader);
      });

      await test.step('checkout button opens step 1', async () => {
        await page.getByRole('button', { name: 'Checkout' }).click();
        await expect(page).toHaveURL(SauceRoutes.checkoutInfoPage);
        await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.checkoutInfoHeader);
      });

      await test.step('fill out details', async () => {
        await page.getByLabel('First Name').fill('Testing');
        await page.getByLabel('Last Name').fill('Analyst');
        await page.getByLabel('Zip/Postal Code').fill('11111');
      });

      await test.step('continue button opens step 2', async () => {
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page).toHaveURL(SauceRoutes.checkoutOverviewPage);
        await expect(page.getByTestId('title')).toHaveText(TitlesHeaders.checkoutOverviewHeader);
      });

      await test.step('price summary shows the expected amount', async () => {
        await expect
          .soft(page.getByTestId('subtotal-label'))
          .toHaveText(SauceBackPackPriceSummary.itemTotal);
        await expect.soft(page.getByTestId('tax-label')).toHaveText(SauceBackPackPriceSummary.tax);
        await expect
          .soft(page.getByTestId('total-label'))
          .toHaveText(SauceBackPackPriceSummary.total);
      });

      await test.step('checkout total has correct amount', async () => {
        const summary = await readPriceSummary(page);

        expect(summary.total).toBe(summary.subTotal + summary.tax);
      });
    },
  );
});
