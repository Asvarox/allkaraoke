// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import eslintConfigPrettier from 'eslint-config-prettier/flat';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import reactPlugin from 'eslint-plugin-react';
import pluginReactCompiler from 'eslint-plugin-react-compiler';
import reactRefresh from 'eslint-plugin-react-refresh';
import typescriptPlugin from 'typescript-eslint';

export default [
  reactRefresh.configs.vite,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
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
  ...typescriptPlugin.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    plugins: {
      'react-compiler': pluginReactCompiler,
      'eslint-plugin-react': reactPlugin,
      'no-only-tests': noOnlyTests,
    },

    languageOptions: {
      globals: {},
    },

    rules: {
      'react-compiler/react-compiler': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      'no-only-tests/no-only-tests': 'error',
      'no-var': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
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
  ...storybook.configs['flat/recommended'],
  eslintConfigPrettier,
];
