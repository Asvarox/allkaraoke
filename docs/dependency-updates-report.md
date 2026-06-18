# Dependency Overrides Report

This file documents the overrides currently present in `package.json`, why each one is needed, and the installed dependency chain that prevents a clean upstream update.

| Override | Why needed | Blocking installed dependency chain |
| --- | --- | --- |
| `@babel/core -> 7.29.6` | Clears the low Babel advisory still present through tooling that resolved older nested Babel versions. | `eslint-plugin-react-compiler@19.1.0-rc.2`, `@vitejs/plugin-react@4.7.0`, `@vitejs/plugin-react@5.2.0`, `@sentry/vite-plugin@4.9.1`, and `@storybook/react-vite@10.4.6` all resolved older nested `@babel/core` copies before the override. |
| `ajv@6.12.6 -> 6.15.0` | Clears the moderate AJV ReDoS advisory in the older AJV line still pulled by ESLint. | `eslint@9.39.2` still resolved `ajv@6.12.6`; that copy is reused through `eslint-config-prettier@10.1.8`, `eslint-plugin-react@7.37.5`, `eslint-plugin-react-refresh@0.4.26`, `eslint-plugin-react-compiler@19.1.0-rc.2`, `eslint-plugin-storybook@10.4.6`, and `typescript-eslint@8.61.1`. |
| `brace-expansion@1.1.12 -> 1.1.15` | Clears the vulnerable `brace-expansion` copy still sitting under old `minimatch@3.1.2` consumers. | The old copy came from `eslint@9.39.2 -> minimatch@3.1.2` and `npm-run-all@4.1.5 -> minimatch@3.1.2`. |
| `diff -> 4.0.4` | Clears the low advisory in `diff`. | `ts-node@10.9.2` still resolved `diff@4.0.2`. |
| `esbuild@0.27.3 -> 0.28.1` | Clears the low advisory on the older `esbuild` line. | The vulnerable copy came from `wrangler@4.101.0 -> esbuild@0.27.3` and `@cloudflare/vitest-pool-workers@0.16.16 -> esbuild@0.27.3`. |
| `express -> 4.22.2` | Pulls in patched transitive HTTP routing dependencies for the legacy peer server package. | `peer@1.0.2` resolved `express@4.21.2`, which still depended on vulnerable `path-to-regexp@0.1.12`. |
| `form-data -> 2.5.6` | Clears the critical/high `form-data` advisories without forcing a larger MusicBrainz dependency change. | `musicbrainz-api@0.11.0 -> @types/request-promise-native@1.0.21 -> @types/request@2.48.12 -> form-data@2.5.2`. |
| `js-yaml -> 4.2.0` | Clears the moderate `js-yaml` advisory for the `4.x` line. | `eslint@9.39.2 -> @eslint/eslintrc@3.3.3 -> js-yaml@4.1.1` and `knip@5.80.2 -> js-yaml@4.1.1`. |
| `lodash -> 4.18.1` | Clears the lodash advisory in the WDYR dev-helper path. | `@welldone-software/why-did-you-render@10.0.1 -> lodash@4.17.21`. |
| `minimatch@3.1.2 -> 3.1.5` | Clears the old `minimatch` ReDoS advisories in the `3.1.2` line. | The vulnerable copy came from `eslint@9.39.2` and is reused through the rest of the installed ESLint plugin stack. |
| `path-to-regexp@0.1.12 -> 0.1.13` | Clears the last high advisory under the legacy peer-server stack. | `peer@1.0.2 -> express@4.22.2 -> path-to-regexp@0.1.12`. `peer` did not yet pull the patched nested route matcher cleanly. |
| `picomatch@2.3.1 -> 2.3.2` | Clears the old `picomatch` advisory in the `2.3.1` line. | `knip@5.80.2 -> fast-glob@3.3.3 -> micromatch@4.0.8 -> picomatch@2.3.1` and `lint-staged@15.2.10 -> micromatch@4.0.8 -> picomatch@2.3.1`. |
| `picomatch@4.0.3 -> 4.0.4` | Clears the old `picomatch` advisory in the `4.0.3` line. | `knip@5.80.2 -> picomatch@4.0.3` and `rollup-plugin-visualizer@6.0.5 -> picomatch@4.0.3`. |
| `shell-quote -> 1.8.4` | Clears the critical `shell-quote` advisory. | `npm-run-all@4.1.5 -> shell-quote@1.8.2`. |
| `smol-toml -> 1.6.1` | Clears the low advisory in `smol-toml`. | `knip@5.80.2 -> smol-toml@1.6.0`. |
| `webpack -> 5.104.1` | Clears the low Storybook/webpack `buildHttp` advisories. | `@storybook/react-vite@10.4.6 -> @storybook/builder-vite@10.4.6 -> @storybook/csf-plugin@10.4.6 -> webpack@5.96.1`. |
| `ws -> 8.21.0` | Clears the `ws` memory-exhaustion advisory. | The vulnerable copies came from `@cloudflare/vite-plugin@1.41.0`, `@cloudflare/vitest-pool-workers@0.16.16`, `wrangler@4.101.0`, and `peer@1.0.2`. |
| `yaml@1.10.2 -> 1.10.3` | Clears the vulnerable `yaml` copy in the legacy `1.x` line. | `@emotion/babel-plugin@11.13.5 -> babel-plugin-macros@3.1.0 -> cosmiconfig@7.0.1 -> yaml@1.10.2`, reused through the installed Emotion and MUI stack. |
| `yaml@2.5.1 -> 2.8.3` | Clears the vulnerable `yaml` copy in the `2.x` line used by the Vite toolchain. | `vite@8.0.16 -> yaml@2.5.1`, reused by `vite-tsconfig-paths@6.1.1`, `@cloudflare/vite-plugin@1.41.0`, `@cloudflare/vitest-pool-workers@0.16.16`, `vitest@4.1.9`, `@playwright/experimental-ct-react@1.61.0`, `@storybook/react-vite@10.4.6`, and `lint-staged@15.2.10`. |
