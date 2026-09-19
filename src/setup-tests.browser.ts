import { locators, type Locator } from 'vitest/browser';

import '~/index.css';

// Mirrors the inline script in index.html - some modules rely on the node-only `global`
globalThis.global = globalThis;

// Plain CSS selectors, for markup that has no accessible role/label to query by (e.g. `[data-e2e-focused]`)
locators.extend({
  css(selector: string) {
    return selector;
  },
});

declare module 'vitest/browser' {
  interface LocatorSelectors {
    css(selector: string): Locator;
  }
}
