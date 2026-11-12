import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default defineConfig(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/'] },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  { files: ['**/*.mjs'], extends: [tseslint.configs.disableTypeChecked] },
  {
    files: ['tests/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: { 'playwright/no-wait-for-timeout': 'error' },
  },
  prettier,
);
