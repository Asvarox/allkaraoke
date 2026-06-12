import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Refresh from '@mui/icons-material/Refresh';
import { Alert, Button, IconButton, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Link } from 'wouter';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { RegenerateIndexButton } from './regenerate-index-button';
import { buildAdminSharedSongProcessingUrl, getOldestAdminSharedSong } from './shared-song-processing-queue';
import {
  AdminSharedSong,
  deleteAdminSharedSong,
  listAdminSharedSongs,
  regenerateAdminSharedSongsIndex,
} from './shared-songs-admin-api';

interface Props {
  password: string;
}

const columns: MRT_ColumnDef<AdminSharedSong>[] = [
  {
    accessorKey: 'artist',
    header: 'Artist',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorFn: (song) => song.language.join(', '),
    id: 'language',
    header: 'Language',
  },
  {
    accessorKey: 'firstSeenAt',
    header: 'Added',
    Cell: ({ cell }) => {
      const val = cell.getValue<number>();

      return val && <span>{dayjs(val).format('MMM DD YYYY, HH:mm')}</span>;
    },
  },
];

export function SharedSongManagement({ password }: Props) {
  const navigate = useSmoothNavigate();
  const sharedSongsKey = password ? (['admin-shared-songs', password] as const) : null;
  const {
    data: songs = [],
    error: listError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(sharedSongsKey, ([, adminPassword]) => listAdminSharedSongs(adminPassword), {
    keepPreviousData: true,
  });

  const {
    trigger: deleteSong,
    error: deleteError,
    isMutating: isDeleting,
    reset: resetDeleteError,
  } = useSWRMutation(
    sharedSongsKey,
    ([, adminPassword], { arg: externalSongId }: { arg: string }) =>
      deleteAdminSharedSong(adminPassword, externalSongId),
    {
      onSuccess: () => {
        void mutate();
      },
    },
  );

  const {
    trigger: regenerateIndex,
    error: regenerateError,
    isMutating: isRegenerating,
    reset: resetRegenerateError,
  } = useSWRMutation(sharedSongsKey, ([, adminPassword]) => regenerateAdminSharedSongsIndex(adminPassword), {
    onSuccess: () => {
      void mutate();
    },
  });

  const oldestSongToProcess = getOldestAdminSharedSong(songs);
  const isBusy = isLoading || isValidating || isDeleting || isRegenerating;
  const error = listError ?? deleteError ?? regenerateError;
  const errorMessage = error instanceof Error ? error.message : null;

  const handleDelete = async (externalSongId: string) => {
    if (!global.confirm('Remove this shared song from Cloudflare KV?')) return;

    resetRegenerateError();

    try {
      await deleteSong(externalSongId);
    } catch {
      // SWR stores the error for the alert above.
    }
  };

  const handleRegenerateIndex = async () => {
    resetDeleteError();

    try {
      await regenerateIndex();
    } catch {
      // SWR stores the error for the alert above.
    }
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg!">Shared Songs Management</h1>
          <p className="mt-1 text-sm">{songs.length} shared songs in Cloudflare KV</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="contained"
            onClick={() => {
              if (oldestSongToProcess) {
                navigate(buildAdminSharedSongProcessingUrl(oldestSongToProcess.externalSongId, true));
              }
            }}
            disabled={isBusy || !oldestSongToProcess}>
            Process oldest unverified
          </Button>
          <RegenerateIndexButton disabled={isBusy} onRegenerate={() => void handleRegenerateIndex()} />
          <Button
            startIcon={<Refresh />}
            variant="outlined"
            onClick={() => {
              resetDeleteError();
              resetRegenerateError();
              void mutate();
            }}
            disabled={isBusy}>
            Refresh
          </Button>
        </div>
      </div>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <MaterialReactTable
        columns={columns}
        data={songs}
        state={{ isLoading: isBusy }}
        getRowId={(song) => song.externalSongId}
        enableRowActions
        positionActionsColumn="last"
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
        }}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        renderRowActions={({ row }) => (
          <div className="flex items-center gap-1">
            <Tooltip title="Edit shared song">
              <span>
                <Link
                  to={buildAdminSharedSongProcessingUrl(row.original.externalSongId)}
                  aria-label={`Edit ${row.original.title}`}>
                  <IconButton>
                    <Edit />
                  </IconButton>
                </Link>
              </span>
            </Tooltip>
            <Tooltip title="Delete shared song">
              <IconButton
                aria-label={`Delete ${row.original.title}`}
                onClick={() => void handleDelete(row.original.externalSongId)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </div>
        )}
      />
    </section>
  );
}
