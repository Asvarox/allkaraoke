import { expect, test } from '@playwright/experimental-ct-react';
import { AutocompleteTestWrapper } from 'modules/Elements/Autocomplete';

test.use({ viewport: { width: 500, height: 500 } });

test('should properly input using the autocomplete box', async ({ mount }) => {
  const component = await mount(
    <AutocompleteTestWrapper focused label="label" options={['first option', 'second option']} />,
  );

  await component.locator('input').click();
  await expect(component.locator('[role="listbox"]')).toBeVisible();
  await component.locator('input').press('ArrowDown');
  await expect(component.locator('[data-e2e-focused="true"]')).toContainText('first option');
  await component.locator('input').press('ArrowDown');
  await expect(component.locator('[data-e2e-focused="true"]')).toContainText('second option');
  await component.locator('input').press('ArrowUp');
  await expect(component.locator('[data-e2e-focused="true"]')).toContainText('first option');
  await component.locator('input').press('Enter');
  await expect(component.locator('input')).toHaveValue('first option');
  await expect(component.locator('[role="listbox"]')).not.toBeVisible();
  await component.locator('input').press('Backspace');
  await expect(component.locator('[role="listbox"]')).not.toBeVisible();
  await expect(component.locator('[role="listbox"]')).toContainText('first option');
  await expect(component.locator('[role="listbox"]')).not.toContainText('second option');
  await component.locator('input').press('ArrowDown');
  await component.locator('input').press('Enter');
  await component.locator('input').press('ArrowDown');
  await expect(component.locator('input')).not.toBeFocused();

  await expect(component).toContainText('label');
});

test('should start inputting if the input is focused', async ({ mount }) => {
  const component = await mount(
    <AutocompleteTestWrapper focused label="label" options={['first option', 'second option']} />,
  );

  await component.locator('input').press('A');
  await expect(component.locator('input')).toBeFocused();
  await expect(component.locator('input')).toHaveValue('A');
});
