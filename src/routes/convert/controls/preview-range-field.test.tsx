import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PreviewRangeField from '~/routes/convert/controls/preview-range-field';
import ConvertForm from '~/routes/convert/convert-form';

vi.mock('react-youtube', () => ({
  default: () => <div data-test="mock-youtube-player" />,
}));

vi.mock('~/modules/songs/hooks/use-song-index', () => ({
  default: () => ({ data: [] }),
}));

describe('PreviewRangeField', () => {
  it('binds preview start and end as one range control', () => {
    render(
      <ConvertForm>
        <PreviewRangeField videoId="" />
      </ConvertForm>,
    );

    const sliders = screen.getAllByRole('slider', { name: /preview/i });
    expect(sliders).toHaveLength(2);
  });
});
