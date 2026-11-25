# Bugs

Defects found in [Sauce Demo](https://www.saucedemo.com) while testing its deliberately faulty
user accounts. Each bug was reproduced against `standard_user` as the baseline.

| ID      | Title                                                 | User                    | Severity | Automated |
| ------- | ----------------------------------------------------- | ----------------------- | -------- | --------- |
| BUG-001 | Products page takes ~5s to render after login         | performance_glitch_user | Medium   | Yes       |
| BUG-002 | Typing in Last Name overwrites First Name at checkout | problem_user            | High     | Yes       |
| BUG-003 | Add to cart does nothing for three products           | problem_user            | High     | No        |
| BUG-004 | Product name opens the wrong product's detail page    | problem_user            | Medium   | No        |
| BUG-005 | Sorting has no effect on the product list             | problem_user            | Medium   | No        |
| BUG-006 | Remove does nothing on the inventory page             | problem_user            | Medium   | No        |
| BUG-007 | Every product shows the same placeholder image        | problem_user            | Low      | No        |

Severity: **High** blocks a purchase, **Medium** gives wrong or degraded behavior with a
workaround, **Low** is cosmetic.

## BUG-001: Products page takes ~5s to render after login

- **User:** performance_glitch_user
- **Severity:** Medium (login works, but the critical path is slow)
- **Environment:** Chromium, Firefox, WebKit (Playwright); found 2026-11-24
- **Steps to reproduce:**
  1. Go to https://www.saucedemo.com
  2. Log in as `performance_glitch_user`
- **Expected:** Products page renders about as fast as for `standard_user` (0.5–0.9s measured)
- **Actual:** Products page renders after 5.07–5.17s (9 runs across the 3 browsers)
- **Evidence:** Budget test failure without `test.fail`: `Expected: < 2500, Received: 5167`
- **Automated:** `tests/ui/sauce-demo/error-users.spec.ts`
  - `performance glitch user can log in despite a slow response`: checks the user still
    reaches the products page
  - `performance glitch user sees the products page within the login budget`: known-bug
    test (`test.fail`) against a 2.5s budget

## BUG-002: Typing in Last Name overwrites First Name at checkout

- **User:** problem_user
- **Severity:** High (no one using this account can complete checkout)
- **Environment:** Chromium, Firefox, WebKit (Playwright); found 2026-11-24
- **Steps to reproduce:**
  1. Log in as `problem_user`
  2. Add "Sauce Labs Backpack" to the cart, open the cart, click **Checkout**
  3. Type `Testing` in **First Name**, then `Analyst` in **Last Name**
- **Expected:** First Name shows `Testing`; Last Name shows `Analyst`
- **Actual:** First Name shows `Analyst`; Last Name stays empty
- **Evidence:** Test failure without `test.fail`: `Expected: "Testing", Received: "Analyst"`
- **Automated:** `tests/ui/sauce-demo/error-users.spec.ts`,
  `problem user can enter a last name at checkout`: known-bug test (`test.fail`) that checks
  each field keeps the typed value

## BUG-003: Add to cart does nothing for three products

- **User:** problem_user
- **Severity:** High (these products cannot be bought)
- **Environment:** Chromium (Playwright exploratory script); found 2026-11-24
- **Steps to reproduce:**
  1. Log in as `problem_user`
  2. On the products page, click **Add to cart** for each product
- **Expected:** Each click adds the product, the cart badge goes up by 1, and the button
  changes to **Remove**
- **Actual:** For "Sauce Labs Bolt T-Shirt", "Sauce Labs Fleece Jacket" and
  "Test.allTheThings() T-Shirt (Red)", nothing happens: the badge doesn't change and the
  button stays **Add to cart**. The other three products add normally.
- **Automated:** No

## BUG-004: Product name opens the wrong product's detail page

- **User:** problem_user
- **Severity:** Medium (the user sees details and a price for a different product)
- **Environment:** Chromium (Playwright exploratory script); found 2026-11-24
- **Steps to reproduce:**
  1. Log in as `problem_user`
  2. Click the product name "Sauce Labs Backpack"
- **Expected:** Detail page for Sauce Labs Backpack (`/inventory-item.html?id=4`, $29.99)
- **Actual:** Detail page for Sauce Labs Fleece Jacket (`/inventory-item.html?id=5`, $49.99)
- **Automated:** No

## BUG-005: Sorting has no effect on the product list

- **User:** problem_user
- **Severity:** Medium (the list is still usable, just not sortable)
- **Environment:** Chromium (Playwright exploratory script); found 2026-11-24
- **Steps to reproduce:**
  1. Log in as `problem_user`
  2. Choose **Name (Z to A)** in the sort dropdown, then **Price (low to high)**
- **Expected:** Products are reordered (for `standard_user`, Z to A starts with
  "Test.allTheThings() T-Shirt (Red)"; low to high starts at $7.99)
- **Actual:** The list stays in the default A to Z order for both options (starts with
  "Sauce Labs Backpack", $29.99)
- **Automated:** No. `tests/ui/sauce-demo/inventory.spec.ts` covers sorting for
  `standard_user` only.

## BUG-006: Remove does nothing on the inventory page

- **User:** problem_user
- **Severity:** Medium (items can't be removed from the products page)
- **Environment:** Chromium (Playwright exploratory script); found 2026-11-24
- **Steps to reproduce:**
  1. Log in as `problem_user`
  2. Click **Add to cart** for "Sauce Labs Backpack" (the badge shows 1)
  3. Click **Remove** on the same product
- **Expected:** The badge goes down by 1 and the button changes back to **Add to cart**
- **Actual:** The badge doesn't change and the button stays **Remove**. Seen for all three
  products that could be added (Backpack, Bike Light, Onesie).
- **Notes:** Removing from the cart page was not tested.
- **Automated:** No

## BUG-007: Every product shows the same placeholder image

- **User:** problem_user
- **Severity:** Low (cosmetic; names and prices are still shown)
- **Environment:** Chromium (Playwright exploratory script); found 2026-11-24
- **Steps to reproduce:**
  1. Log in as `problem_user`
  2. Look at the product images on the products page
- **Expected:** Each product shows its own photo (backpack, bike light, and so on)
- **Actual:** All six products show the same placeholder image (`sl-404` file)
- **Automated:** No
