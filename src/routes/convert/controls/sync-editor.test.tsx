import { fireEvent, render, screen } from '@testing-library/react';
import { useFormContext } from 'react-hook-form';
import { vi } from 'vitest';
import TxtEditor from '~/routes/convert/controls/txt-editor';
import ConvertForm from '~/routes/convert/convert-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

vi.mock('~/modules/songs/hooks/use-song-index', () => ({
  default: () => ({ data: [] }),
}));

function SyncDeltaProbe() {
  const { setValue } = useFormContext<ConvertFormValues>();

  return (
    <button
      onClick={() => {
        setValue('committedSong', {} as ConvertFormValues['committedSong']);
        setValue('txt.draftDirty', true);
        setValue('sync.gapShift', '1000', { shouldDirty: true });
      }}>
      Set active deltas
    </button>
  );
}

describe('Sync editor apply flow', () => {
  it('shows a confirmation dialog when applying txt with active deltas', async () => {
    render(
      <ConvertForm>
        <SyncDeltaProbe />
        <TxtEditor />
      </ConvertForm>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Set active deltas' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply TXT' }));

    expect(screen.getByRole('button', { name: /apply deltas into txt and reset deltas/i })).toBeVisible();
  });
});
