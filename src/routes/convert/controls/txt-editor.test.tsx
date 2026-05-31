import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import TxtEditor from '~/routes/convert/controls/txt-editor';
import ConvertForm from '~/routes/convert/convert-form';

vi.mock('~/modules/songs/hooks/use-song-index', () => ({
  default: () => ({ data: [] }),
}));

describe('TxtEditor', () => {
  it('renders the draft txt field and helper actions from form state', () => {
    render(
      <ConvertForm>
        <TxtEditor />
      </ConvertForm>,
    );

    expect(screen.getByLabelText("Song's UltraStar .TXT file contents")).toBeVisible();
    expect(screen.getAllByRole('button', { name: /fix/i })).toHaveLength(2);
  });
});
