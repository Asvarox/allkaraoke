import { locators } from '@vitest/browser/context';

locators.extend({
  locator(selector: string) {
    return selector;
  },
});

declare module '@vitest/browser/context' {
  interface LocatorSelectors {
    locator(title: string): Locator;
  }
}
