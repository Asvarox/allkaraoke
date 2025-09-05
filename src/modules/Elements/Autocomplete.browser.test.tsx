import { page, userEvent } from '@vitest/browser/context';
import { AutocompleteTestWrapper } from 'modules/Elements/Autocomplete';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

test('should properly input using the autocomplete box', async () => {
  render(<AutocompleteTestWrapper focused label="label" options={['first option', 'second option']} />);

  await page.getByRole('textbox').click();
  await expect.element(page.getByRole('listbox')).toBeVisible();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(page.locator('[data-e2e-focused="true"]')).toHaveTextContent('first option');
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(page.locator('[data-e2e-focused="true"]')).toHaveTextContent('second option');
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(page.locator('[data-e2e-focused="true"]')).toHaveTextContent('first option');
  await userEvent.keyboard('{Enter}');
  await expect.element(page.getByRole('textbox')).toHaveValue('first option');
  await expect.element(page.locator('[role="listbox"]').query()).toBeNull();
  await userEvent.keyboard('{Backspace}');
  await expect.element(page.locator('[role="listbox"]')).toBeVisible();
  await expect.element(page.locator('[role="listbox"]')).toHaveTextContent('first option');
  await expect.element(page.locator('[role="listbox"]')).not.toHaveTextContent('second option');
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard('{ArrowDown}');

  await expect.element(page.getByRole('textbox')).not.toHaveFocus();

  await expect.element(page.getByText('label')).toBeVisible();
});

test('should start inputting if the input is focused', async () => {
  render(<AutocompleteTestWrapper focused label="label" options={['first option', 'second option']} />);

  await userEvent.keyboard('A');
  await expect.element(page.locator('input')).toHaveFocus();
  await expect.element(page.locator('input')).toHaveValue('A');
});
