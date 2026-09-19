import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import { SelectTestWrapper } from '~/modules/elements/akui/select';

beforeEach(async () => {
  await page.viewport(500, 500);
});

const OPTIONS = [
  { value: 'none', label: 'Prefer not to say' },
  { value: 'pl', label: 'Poland' },
  { value: 'de', label: 'Germany' },
  { value: 'gb', label: 'United Kingdom' },
];

test('should filter options by search and commit with Enter', async () => {
  const screen = await render(<SelectTestWrapper focused label="Country" options={OPTIONS} />);
  const input = screen.getByRole('combobox');
  const listbox = screen.getByRole('listbox');

  await input.click();
  await expect.element(listbox).toBeVisible();

  await input.fill('ger');
  await expect.element(listbox).toHaveTextContent('Germany');
  await expect.element(listbox).not.toHaveTextContent('Poland');

  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByTestId('committed-value')).toHaveTextContent(/^de$/);
  await expect.element(input).toHaveValue('Germany');
  await expect.element(listbox).not.toBeInTheDocument();
});

test('should select with the arrow keys', async () => {
  const screen = await render(<SelectTestWrapper focused label="Country" options={OPTIONS} />);
  const focusedOption = screen.css('[data-e2e-focused="true"]');

  await screen.getByRole('combobox').click();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(focusedOption).toHaveTextContent('Prefer not to say');
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(focusedOption).toHaveTextContent('Poland');
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(focusedOption).toHaveTextContent('Prefer not to say');

  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Enter}');
  await expect.element(screen.getByTestId('committed-value')).toHaveTextContent(/^pl$/);
});

test('should revert the search on Escape and keep the committed value', async () => {
  const screen = await render(<SelectTestWrapper focused label="Country" options={OPTIONS} initialValue="gb" />);
  const input = screen.getByRole('combobox');
  const listbox = screen.getByRole('listbox');

  await expect.element(input).toHaveValue('United Kingdom');

  await input.click();
  await input.fill('pol');
  await expect.element(listbox).toHaveTextContent('Poland');

  await userEvent.keyboard('{Escape}');
  await expect.element(listbox).not.toBeInTheDocument();
  await expect.element(input).toHaveValue('United Kingdom');
  await expect.element(screen.getByTestId('committed-value')).toHaveTextContent(/^gb$/);
});

test('should commit an option on click', async () => {
  const screen = await render(<SelectTestWrapper focused label="Country" options={OPTIONS} />);

  await screen.getByRole('combobox').click();
  await screen.getByRole('option', { name: 'Poland' }).click();

  await expect.element(screen.getByTestId('committed-value')).toHaveTextContent(/^pl$/);
});

test('should keep the first option reachable when the list overflows', async () => {
  const manyOptions = Array.from({ length: 120 }, (_, index) => ({
    value: `option-${index}`,
    label: `Option ${index}`,
  }));

  const screen = await render(<SelectTestWrapper focused label="Country" options={manyOptions} />);

  await screen.getByRole('combobox').click();
  const menu = screen.getByRole('listbox');
  const options = screen.getByRole('option');
  await expect.element(menu).toBeVisible();

  // A centred flex column that overflows pushes its leading items past the scroll origin, where
  // nothing can scroll them back into view
  expect(menu.element().scrollTop).toBe(0);
  await expect.element(options.first()).toBeInViewport();

  menu.element().scrollTo({ top: menu.element().scrollHeight });
  await expect.element(options.last()).toBeInViewport();

  menu.element().scrollTo({ top: 0 });
  await expect.element(options.first()).toBeInViewport();

  // A row shorter than its own line box crops the label — compare the rendered height against
  // what the text inside actually needs
  const firstOption = options.first();
  await expect.element(firstOption).toHaveTextContent('Option 0');
  const element = firstOption.element();
  const label = element.querySelector('span') ?? element;
  expect(element.clientHeight).toBeGreaterThanOrEqual(label.scrollHeight);
});
