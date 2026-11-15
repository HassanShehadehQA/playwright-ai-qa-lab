import { test, expect, type Page } from '@playwright/test';
import { SauceProducts, SauceRoutes, SauceUsers } from '../../../src/data/sauce-demo';
import { env } from '../../../src/utils/env';

test.describe('Cart', () => {
  const productCard = (page: Page, name: string) =>
    page.getByTestId('inventory-item').filter({ hasText: name });

  test.beforeEach(async ({ page }) => {
    await page.goto(SauceRoutes.loginPage);
    await page.getByLabel('Username').fill(SauceUsers.standard);
    await page.getByLabel('Password').fill(env.saucePassword);
    await page.getByRole('button', { name: 'Login' }).click();
  });

  test('adding a product shows a cart badge of 1', { tag: '@smoke' }, async ({ page }) => {
    await test.step('add a product and validate cart badge is 1', async () => {
      await productCard(page, SauceProducts.backpack)
        .getByRole('button', { name: 'Add to cart' })
        .click();

      await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    });
  });

  test('adding two products shows a cart badge of 2', { tag: '@regression' }, async ({ page }) => {
    await test.step('add the backpack and the bike light', async () => {
      await productCard(page, SauceProducts.backpack)
        .getByRole('button', { name: 'Add to cart' })
        .click();

      await productCard(page, SauceProducts.bikeLight)
        .getByRole('button', { name: 'Add to cart' })
        .click();

      await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
    });
  });

  test(
    'removing a product from the cart leaves only the other product',
    { tag: '@regression' },
    async ({ page }) => {
      await test.step('add the backpack and the bike light', async () => {
        await productCard(page, SauceProducts.backpack)
          .getByRole('button', { name: 'Add to cart' })
          .click();
        await productCard(page, SauceProducts.bikeLight)
          .getByRole('button', { name: 'Add to cart' })
          .click();
        await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
      });

      await test.step('open the cart', async () => {
        // Cart icon is an <a> without href, so it has no link role; test id is the only stable hook.
        await page.getByTestId('shopping-cart-link').click();
        await expect(page.getByTestId('inventory-item')).toHaveCount(2);
      });

      await test.step('remove the backpack from the cart', async () => {
        await productCard(page, SauceProducts.backpack)
          .getByRole('button', { name: 'Remove' })
          .click();
      });

      await test.step('only the bike light remains in the cart', async () => {
        await expect(page.getByTestId('inventory-item')).toHaveCount(1);
        await expect(productCard(page, SauceProducts.bikeLight)).toBeVisible();
        await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
      });
    },
  );

  test(
    'removing the last product hides the cart badge',
    { tag: '@regression' },
    async ({ page }) => {
      await test.step('add the backpack', async () => {
        await productCard(page, SauceProducts.backpack)
          .getByRole('button', { name: 'Add to cart' })
          .click();

        await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
      });

      await test.step('remove the backpack', async () => {
        await productCard(page, SauceProducts.backpack)
          .getByRole('button', { name: 'Remove' })
          .click();
      });

      await test.step('cart badge is hidden', async () => {
        await expect(page.getByTestId('shopping-cart-badge')).toBeHidden();
      });
    },
  );
});
