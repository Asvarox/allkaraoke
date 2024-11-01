import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import reactPlugin from 'eslint-plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import typescriptPlugin from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/playwright/',
      '**/build',
      '**/node_modules',
      '**/storybook-static',
      '**/test-results',
      '**/playwright-report',
      '**/out',
    ],
  },
  ...fixupConfigRules(compat.extends('prettier')),
  ...typescriptPlugin.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    plugins: {
      'eslint-plugin-react': reactPlugin,
      'no-only-tests': noOnlyTests,
    },

    languageOptions: {
      globals: {},
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      'no-only-tests/no-only-tests': 'error',
      'no-var': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': 'off',
      'react/display-name': 'off',
    },
  },
  {
    files: ['tests/**.ts', 'src/**/*.spec.tsx'],

    rules: {
      'testing-library/prefer-screen-queries': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
