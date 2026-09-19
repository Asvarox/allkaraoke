import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import { AutocompleteTestWrapper } from '~/modules/elements/autocomplete';

beforeEach(async () => {
  await page.viewport(500, 500);
});

test('should properly input using the autocomplete box', async () => {
  const screen = await render(
    <AutocompleteTestWrapper focused label="label" options={['first option', 'second option']} />,
  );
  const input = screen.getByRole('textbox');
  const listbox = screen.getByRole('listbox');
  const focusedOption = screen.css('[data-e2e-focused="true"]');

  await input.click();
  await expect.element(listbox).toBeVisible();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(focusedOption).toHaveTextContent('first option');
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(focusedOption).toHaveTextContent('second option');
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(focusedOption).toHaveTextContent('first option');
  await userEvent.keyboard('{Enter}');
  await expect.element(input).toHaveValue('first option');
  await expect.element(listbox).not.toBeInTheDocument();
  await userEvent.keyboard('{Backspace}');
  await expect.element(listbox).toBeVisible();
  await expect.element(listbox).toHaveTextContent('first option');
  await expect.element(listbox).not.toHaveTextContent('second option');
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(input).not.toHaveFocus();

  await expect.element(screen.getByText('label')).toBeVisible();
});

test('should start inputting if the input is focused', async () => {
  const screen = await render(
    <AutocompleteTestWrapper focused label="label" options={['first option', 'second option']} />,
  );
  const input = screen.getByRole('textbox');

  await userEvent.keyboard('A');
  await expect.element(input).toHaveFocus();
  await expect.element(input).toHaveValue('A');
});
