import { expect, test } from '@playwright/experimental-ct-react';

import { SelectTestWrapper } from '~/modules/elements/akui/select';

test.use({ viewport: { width: 500, height: 500 } });

const OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'pl', label: 'Poland' },
  { value: 'de', label: 'Germany' },
  { value: 'gb', label: 'United Kingdom' },
];

test('should filter options by search and commit with Enter', async ({ mount }) => {
  const component = await mount(<SelectTestWrapper focused label="Country" options={OPTIONS} />);

  await component.locator('input').click();
  await expect(component.locator('[role="listbox"]')).toBeVisible();

  await component.locator('input').fill('ger');
  await expect(component.locator('[role="listbox"]')).toContainText('Germany');
  await expect(component.locator('[role="listbox"]')).not.toContainText('Poland');

  await component.locator('input').press('Enter');
  await expect(component.locator('[data-test="committed-value"]')).toHaveText('de');
  await expect(component.locator('input')).toHaveValue('Germany');
  await expect(component.locator('[role="listbox"]')).not.toBeVisible();
});

test('should select with the arrow keys', async ({ mount }) => {
  const component = await mount(<SelectTestWrapper focused label="Country" options={OPTIONS} />);

  await component.locator('input').click();
  await component.locator('input').press('ArrowDown');
  await expect(component.locator('[data-e2e-focused="true"]')).toContainText('Prefer not to say');
  await component.locator('input').press('ArrowDown');
  await expect(component.locator('[data-e2e-focused="true"]')).toContainText('Poland');
  await component.locator('input').press('ArrowUp');
  await expect(component.locator('[data-e2e-focused="true"]')).toContainText('Prefer not to say');

  await component.locator('input').press('ArrowDown');
  await component.locator('input').press('Enter');
  await expect(component.locator('[data-test="committed-value"]')).toHaveText('pl');
});

test('should revert the search on Escape and keep the committed value', async ({ mount }) => {
  const component = await mount(<SelectTestWrapper focused label="Country" options={OPTIONS} initialValue="gb" />);

  await expect(component.locator('input')).toHaveValue('United Kingdom');

  await component.locator('input').click();
  await component.locator('input').fill('pol');
  await expect(component.locator('[role="listbox"]')).toContainText('Poland');

  await component.locator('input').press('Escape');
  await expect(component.locator('[role="listbox"]')).not.toBeVisible();
  await expect(component.locator('input')).toHaveValue('United Kingdom');
  await expect(component.locator('[data-test="committed-value"]')).toHaveText('gb');
});

test('should commit an option on click', async ({ mount }) => {
  const component = await mount(<SelectTestWrapper focused label="Country" options={OPTIONS} />);

  await component.locator('input').click();
  await component.locator('[role="listitem"]', { hasText: 'Poland' }).click();

  await expect(component.locator('[data-test="committed-value"]')).toHaveText('pl');
});
