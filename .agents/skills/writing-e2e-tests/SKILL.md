---
name: writing-e2e-tests
description: 'Patterns and guidelines for writing Playwright E2E tests in this project — page object rules, assertion placement, and locator conventions. Use when writing new tests or reviewing existing ones.'
---

# Writing E2E Tests

## Locators belong in page objects

`.spec.ts` files must never locate elements directly — all locators must be exposed via a page object:

```ts
// ✅ Locator defined on the page object, used in spec
await expect(pages.historyPage.container).toBeVisible();

// ❌ Locating elements directly in a spec file
await expect(page.getByTestId('history-page')).toBeVisible();
await expect(page.locator('.some-class')).toBeVisible();
```

## Where to put assertions

- **Simple assertions** (e.g. visibility, count) belong in the `.spec.ts` test directly.
- **Assertions that touch implementation details** (e.g. checking an attribute value, computed style) or contain non-trivial logic should be encapsulated as a method on the page object.

```ts
// ✅ Simple visibility check — in spec
await expect(pages.historyPage.emptyState).toBeVisible();

// ✅ Complex / implementation-detail assertion — on page object
// PageObject:
public async expectEntryCount(count: number) {
  await expect(this.entries).toHaveCount(count);
}
// Spec:
await pages.historyPage.expectEntryCount(3);
```

## Assertions

Use `expect(locator).toBeVisible()` instead of `locator.waitFor()`:

```ts
// ✅
await expect(pages.historyPage.container).toBeVisible();
await expect(this.entries).toHaveCount(count);

// ❌
await pages.historyPage.container.waitFor();
await this.entries.nth(count - 1).waitFor();
```

Import `expect` from `@playwright/test` in page objects that use it.
