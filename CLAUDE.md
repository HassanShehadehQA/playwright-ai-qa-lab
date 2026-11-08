# CLAUDE.md — playwright-ai-qa-lab

Enterprise-grade test automation framework: Playwright + TypeScript for UI and API testing,
GitHub Actions CI, and AI-assisted testing (Playwright MCP, test agents, a custom MCP server).

Hold all work in this repo to the standard of a **senior SDET on an enterprise QA team**:
production-quality code, reviewed like a teammate's pull request.

## How to work with me

- Act as a senior SDET reviewer, not just a code generator. Explain the *why*, point out
  trade-offs, and push back if I ask for something that breaks the standards below.
- Prefer official Playwright patterns (playwright.dev). Say when a suggestion is a judgment
  call rather than an established best practice.
- Keep changes small and focused. Show the diff and summarize what changed and why.
- Never weaken an assertion, add a retry, raise a timeout, or skip a test just to make it
  pass. Find and explain the root cause first.
- If app behavior or test intent is unclear, ask instead of guessing.

## Tech stack

- Playwright Test (`@playwright/test`), TypeScript (strict mode), Node.js LTS
- ESLint (`eslint-plugin-playwright`) + Prettier
- `dotenv` for local secrets; GitHub Actions Secrets in CI
- `@faker-js/faker` for test data; `zod` for API schema validation
- GitHub Actions for CI

## Commands

| Task | Command |
|---|---|
| Run all tests (headless) | `npm test` |
| CI run | `npm run test:ci` |
| Watch in a browser | `npm run test:headed` |
| UI mode | `npm run test:ui` |
| Step-through debug | `npm run test:debug` |
| Open last report | `npm run report` |
| One file / one test | `npx playwright test path/to/file.spec.ts[:line]` |
| Lint / format | `npm run lint` / `npm run format` |

Run the affected tests after every change, and the full suite before opening a pull request.

## Project structure

```
src/
  pages/<app>/       one page object per page or screen
  components/        shared UI parts (header, menus, modals)
  api/               typed API clients
  fixtures/          test.extend: page objects, API clients, auth state
  data/              factories (Faker) and static test data
  utils/             helpers, env config
tests/
  setup/             auth setup (log in once, save storageState)
  ui/<app>/          UI specs by feature
  api/<app>/         API specs
  e2e/               hybrid API + UI flows
config/              base URLs per app and environment
mcp/test-case-mcp/   custom MCP server
evals/               golden datasets and scoring for AI output
docs/                TEST_STRATEGY.md, AI_LOG.md, BUGS.md
```

Framework code lives in `src/`; `tests/` holds only specs. Create new folders following this
layout rather than inventing new ones.

## Applications under test

| App | Type | URL |
|---|---|---|
| Sauce Demo | UI | https://www.saucedemo.com (uses `data-test` attributes) |
| Restful-booker | API | https://restful-booker.herokuapp.com |
| Contact List App | UI + API | https://thinking-tester-contact-list.herokuapp.com |
| OrangeHRM | UI (admin console) | https://opensource-demo.orangehrmlive.com |
| TodoMVC | UI | https://demo.playwright.dev/todomvc |

These are shared public demos: use fake data only, keep CI volume low, and never run load or
security tests against them.

## Test design

- One behavior per test. Name tests as requirements: `user can check out with one item`.
- Group with `test.describe` by feature; use `test.step` so reports read like test cases.
- Tests are independent: they run alone, in any order, in parallel. No shared mutable state.
- Each test creates the data it needs and cleans up where the app allows.
- Tag every test `@smoke` (critical path, runs on every PR) or `@regression` (full coverage).
- Cover negative and edge cases, not only the happy path.
- Set up data through the API; use the UI only for the behavior under test.

## Locators and assertions

- User-facing locators, in this order: `getByRole` → `getByLabel` → `getByPlaceholder` /
  `getByText` → `getByTestId`. No XPath; CSS only as a documented last resort.
- No hard waits (`waitForTimeout`), ever. Rely on auto-waiting and web-first assertions.
- Web-first assertions only: `await expect(locator).toBeVisible()`, `toHaveText`,
  `toHaveURL`, `toHaveCount`. Never `expect(await locator.isVisible()).toBe(true)`.
- Every test asserts something meaningful to the user, not just that a page loaded.
- Use `expect.soft` only to check several independent fields on one screen.

## Page objects and fixtures

- One page object per page in `src/pages/<app>/`; shared parts in `src/components/`.
- Locators are `readonly` properties set in the constructor; actions are `async` methods
  named for user intent (`login`, `addToCart`).
- Page objects hold no assertions, except an optional `expectLoaded()` check.
- Specs contain no raw locators; they use page objects.
- Provide page objects and API clients through custom fixtures, not `new` in every test.
- Log in once in an auth setup project and reuse `storageState`.

## API testing

- Wrap endpoints in typed clients in `src/api/` using Playwright's `request` context.
- Assert status codes **and** response bodies; validate response shape with zod schemas.
- Include negative tests: invalid auth, missing fields, unknown IDs (expect correct 4xx codes).
- Never log tokens, passwords, or full auth headers.

## TypeScript and code quality

- Strict mode. No `any` (use real types or `unknown`). No unused or commented-out code.
- `const` by default. Await every Playwright call; no floating promises.
- Small, single-purpose functions with descriptive names. No magic strings or numbers.
- Code passes `npm run lint` and `npm run format` before every commit.

## Configuration and secrets

- `playwright.config.ts` is the single source of truth for base URLs, projects, timeouts,
  retries, and reporters. Don't hard-code URLs or timeouts in tests.
- Don't change global settings (timeouts, retries, workers) to fix one test.
- Secrets live in `.env` (gitignored) locally and GitHub Actions Secrets in CI. Keep
  `.env.example` updated with variable names only.
- Never commit credentials, tokens, `.env`, reports, `test-results/`, or `node_modules/`.

## CI

- Pull requests run `@smoke`; `main` and the nightly schedule run the full suite.
- Upload the HTML report (traces, screenshots, video) as an artifact on every run.
- A red build blocks merging. Fix flaky tests or quarantine them with a tracked issue.

## Git workflow

- Branch from `main`: `feature/…`, `fix/…`, `chore/…`, `docs/…`. Never commit to `main`.
- Conventional commits: `feat(ui): add checkout tests`, `fix(api): handle booking 404`,
  `chore(ci): cache browsers`.
- Small commits, one idea each. Pull requests explain what, why, and how it was tested.

## Flaky tests

- Reproduce with `--repeat-each=10` and read the trace before changing code.
- Usual causes: shared data, missing `await`, timing assumptions, unstable locators.
  Fix the cause. CI retries are a safety net, never the fix.

## AI-assisted work

- Treat AI-generated tests like a teammate's PR: review every locator and assertion.
- Commit test-agent plans to `specs/`; check generated tests against these standards.
- Healer changes go through a PR. Confirm the app change was intended before accepting a
  healed locator or assertion; a healed test can hide a real bug.
- Custom MCP server: validate all inputs, no destructive tools, drafts need human approval.
- Read only the files a task needs, to keep context and token usage focused.

## Definition of done

- [ ] Follows these standards and passes locally in all configured browsers
- [ ] No flakes across `--repeat-each=3`
- [ ] Lint and format clean; no `test.only`, hard waits, or secrets
- [ ] Docs/README updated if commands or behavior changed
- [ ] CI green on the pull request
