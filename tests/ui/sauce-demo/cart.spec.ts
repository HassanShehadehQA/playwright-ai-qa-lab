import { test, expect, type Page } from '@playwright/test';
import { CartLink, SauceProducts, SauceRoutes, SauceUsers } from '../../../src/data/sauce-demo';
import { env } from '../../../src/utils/env';

test.describe('Cart', () => {
  const productCard = (page: Page, name: string) =>
    page.getByTestId('inventory-item').filter({ hasText: name });

  const cartLink = (page: Page) => page.getByRole('button', { name: CartLink.anyCount });

  test.beforeEach(async ({ page }) => {
    await page.goto(SauceRoutes.loginPage);
    await page.getByLabel('Username').fill(SauceUsers.standard);
    await page.getByLabel('Password').fill(env.saucePassword);
    await page.getByRole('button', { name: 'Login' }).click();
  });

  test('adding a product updates the cart to 1 item', { tag: '@smoke' }, async ({ page }) => {
    await test.step('add a product and the cart reports 1 item', async () => {
      await productCard(page, SauceProducts.backpack)
        .getByRole('button', { name: 'Add to cart' })
        .click();

      await expect(cartLink(page)).toHaveAccessibleName(CartLink.oneItem);
    });
  });

  test(
    'adding two products updates the cart to 2 items',
    { tag: '@regression' },
    async ({ page }) => {
      await test.step('add the backpack and the bike light', async () => {
        await productCard(page, SauceProducts.backpack)
          .getByRole('button', { name: 'Add to cart' })
          .click();

        await productCard(page, SauceProducts.bikeLight)
          .getByRole('button', { name: 'Add to cart' })
          .click();

        await expect(cartLink(page)).toHaveAccessibleName(CartLink.twoItems);
      });
    },
  );

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
        await expect(cartLink(page)).toHaveAccessibleName(CartLink.twoItems);
      });

      await test.step('open the cart', async () => {
        await cartLink(page).click();
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
        await expect(cartLink(page)).toHaveAccessibleName(CartLink.oneItem);
      });
    },
  );

  test(
    'removing the last product leaves the cart empty',
    { tag: '@regression' },
    async ({ page }) => {
      await test.step('add the backpack', async () => {
        await productCard(page, SauceProducts.backpack)
          .getByRole('button', { name: 'Add to cart' })
          .click();

        await expect(cartLink(page)).toHaveAccessibleName(CartLink.oneItem);
      });

      await test.step('remove the backpack', async () => {
        await productCard(page, SauceProducts.backpack)
          .getByRole('button', { name: 'Remove' })
          .click();
      });

      await test.step('cart reports empty', async () => {
        await expect(cartLink(page)).toHaveAccessibleName(CartLink.empty);
      });
    },
  );
});
