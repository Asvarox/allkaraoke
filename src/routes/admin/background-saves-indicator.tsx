import { CircularProgress } from '@mui/material';

import { Icon } from '~/modules/elements/akui/icon';

import { dismissFailedAdminUnverifiedSongSave, useAdminUnverifiedSongSaves } from './background-song-save';

export function BackgroundSavesIndicator() {
  const { pending, failed } = useAdminUnverifiedSongSaves();

  if (pending.length === 0 && failed.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-2 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-1">
      {pending.length > 0 && (
        <span
          className="flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-sm text-white shadow-lg"
          data-test="admin-background-saves"
          data-pending-saves={pending.length}
          title={pending.map((save) => save.label).join('\n')}>
          <CircularProgress size={12} color="inherit" />
          Saving {pending.length} song{pending.length > 1 ? 's' : ''} in the background...
        </span>
      )}
      {failed.map((save) => (
        <span
          key={save.sharedSongId}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-red-700/95 px-3 py-1 text-sm text-white shadow-lg"
          data-test="admin-background-save-error"
          data-song={save.sharedSongId}>
          Failed to save {save.label}: {save.message}
          <button
            type="button"
            aria-label={`Dismiss save error for ${save.label}`}
            className="flex cursor-pointer items-center"
            onClick={() => dismissFailedAdminUnverifiedSongSave(save.sharedSongId)}>
            <Icon icon="ic:baseline-close" />
          </button>
        </span>
      ))}
    </div>
  );
}
