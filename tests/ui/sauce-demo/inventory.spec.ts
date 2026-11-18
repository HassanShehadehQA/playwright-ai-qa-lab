import { test, expect, type Page } from '@playwright/test';
import { SauceRoutes, SauceSortOptions, SauceUsers } from '../../../src/data/sauce-demo';
import { env } from '../../../src/utils/env';

test.describe('Inventory', () => {
  const selectSortOption = (page: Page, label: string) =>
    page.getByRole('combobox', { name: 'Sort products' }).selectOption(label);

  const toNumber = (price: string) => Number(price.replace('$', ''));

  const sortByPriceAscending = (prices: string[]) =>
    [...prices].sort((a, b) => toNumber(a) - toNumber(b));
  const sortByPriceDescending = (prices: string[]) =>
    [...prices].sort((a, b) => toNumber(b) - toNumber(a));

  test.beforeEach(async ({ page }) => {
    await page.goto(SauceRoutes.loginPage);
    await page.getByLabel('Username').fill(SauceUsers.standard);
    await page.getByLabel('Password').fill(env.saucePassword);
    await page.getByRole('button', { name: 'Login' }).click();
  });

  test(
    'sorting by price low to high orders products by ascending price',
    { tag: '@regression' },
    async ({ page }) => {
      const prices = page.getByTestId('inventory-item-price');
      await expect(prices).toHaveCount(6);

      const unsorted = await prices.allTextContents();
      const expected = sortByPriceAscending(unsorted);

      await selectSortOption(page, SauceSortOptions.priceLowToHigh);
      await expect(prices).toHaveText(expected);
    },
  );

  test(
    'sorting by price high to low orders products by descending prices',
    { tag: '@regression' },
    async ({ page }) => {
      const prices = page.getByTestId('inventory-item-price');
      await expect(prices).toHaveCount(6);

      const unsorted = await prices.allTextContents();
      const expected = sortByPriceDescending(unsorted);

      await selectSortOption(page, SauceSortOptions.priceHighToLow);
      await expect(prices).toHaveText(expected);
    },
  );
});
