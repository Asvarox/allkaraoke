import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Refresh from '@mui/icons-material/Refresh';
import { Alert, Button, IconButton, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_SortingState,
} from 'material-react-table';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Link } from 'wouter';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { RegenerateIndexButton } from './regenerate-index-button';
import {
  buildAdminUnverifiedSongProcessingUrl,
  getOldestAdminUnverifiedSong,
} from './unverified-song-processing-queue';
import {
  AdminUnverifiedSong,
  deleteAdminUnverifiedSong,
  listAdminUnverifiedSongs,
  regenerateAdminUnverifiedSongsIndex,
} from './unverified-songs-admin-api';

interface Props {
  password: string;
}

const DEFAULT_PAGE_SIZE = 10;
const UNVERIFIED_SONGS_TABLE_PAGE_SIZE_STORAGE_KEY = 'admin-unverified-songs-table-page-size';
const UNVERIFIED_SONGS_TABLE_SORTING_STORAGE_KEY = 'admin-unverified-songs-table-sorting';

const columns: MRT_ColumnDef<AdminUnverifiedSong>[] = [
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
  {
    accessorKey: 'updated',
    header: 'Updated',
    Cell: ({ cell }) => {
      const val = cell.getValue<number>();

      return val && <span>{dayjs(val).format('MMM DD YYYY, HH:mm')}</span>;
    },
  },
];

const isValidSorting = (value: unknown): value is MRT_SortingState =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      typeof entry === 'object' && entry !== null && typeof entry.id === 'string' && typeof entry.desc === 'boolean',
  );

export function UnverifiedSongManagement({ password }: Props) {
  const navigate = useSmoothNavigate();
  const [hasHydratedPersistedState, setHasHydratedPersistedState] = useState(false);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const unverifiedSongsKey = password ? (['admin-unverified-songs', password] as const) : null;
  const {
    data: songs = [],
    error: listError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(unverifiedSongsKey, ([, adminPassword]) => listAdminUnverifiedSongs(adminPassword), {
    keepPreviousData: true,
  });

  const {
    trigger: deleteSong,
    error: deleteError,
    isMutating: isDeleting,
    reset: resetDeleteError,
  } = useSWRMutation(
    unverifiedSongsKey,
    ([, adminPassword], { arg: sharedSongId }: { arg: string }) =>
      deleteAdminUnverifiedSong(adminPassword, sharedSongId),
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
  } = useSWRMutation(unverifiedSongsKey, ([, adminPassword]) => regenerateAdminUnverifiedSongsIndex(adminPassword), {
    onSuccess: () => {
      void mutate();
    },
  });

  const oldestSongToProcess = getOldestAdminUnverifiedSong(songs);
  const isBusy = isLoading || isValidating || isDeleting || isRegenerating;
  const error = listError ?? deleteError ?? regenerateError;
  const errorMessage = error instanceof Error ? error.message : null;

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;

    try {
      const pageSizeValue = localStorage.getItem(UNVERIFIED_SONGS_TABLE_PAGE_SIZE_STORAGE_KEY);
      const sortingValue = localStorage.getItem(UNVERIFIED_SONGS_TABLE_SORTING_STORAGE_KEY);

      if (pageSizeValue) {
        const parsedPageSize = JSON.parse(pageSizeValue);

        if (typeof parsedPageSize === 'number' && Number.isInteger(parsedPageSize) && parsedPageSize > 0) {
          setPagination((currentPagination) => ({
            ...currentPagination,
            pageSize: parsedPageSize,
          }));
        }
      }

      if (sortingValue) {
        const parsedSorting = JSON.parse(sortingValue);

        if (isValidSorting(parsedSorting)) {
          setSorting(parsedSorting);
        }
      }
    } catch {
      // Ignore malformed persisted settings and keep defaults.
    }

    setHasHydratedPersistedState(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedPersistedState || typeof localStorage === 'undefined') return;

    localStorage.setItem(UNVERIFIED_SONGS_TABLE_PAGE_SIZE_STORAGE_KEY, JSON.stringify(pagination.pageSize));
  }, [hasHydratedPersistedState, pagination.pageSize]);

  useEffect(() => {
    if (!hasHydratedPersistedState || typeof localStorage === 'undefined') return;

    localStorage.setItem(UNVERIFIED_SONGS_TABLE_SORTING_STORAGE_KEY, JSON.stringify(sorting));
  }, [hasHydratedPersistedState, sorting]);

  const handleDelete = async (sharedSongId: string) => {
    if (!global.confirm('Remove this unverified song from Cloudflare KV?')) return;

    resetRegenerateError();

    try {
      await deleteSong(sharedSongId);
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
          <h1 className="text-lg!">Unverified Songs Management</h1>
          <p className="mt-1 text-sm">{songs.length} unverified songs in Cloudflare KV</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="contained"
            onClick={() => {
              if (oldestSongToProcess) {
                navigate(buildAdminUnverifiedSongProcessingUrl(oldestSongToProcess.sharedSongId, true));
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
        state={{ isLoading: isBusy, pagination, sorting }}
        getRowId={(song) => song.sharedSongId}
        enableRowActions
        positionActionsColumn="last"
        initialState={{
          density: 'compact',
          showGlobalFilter: true,
        }}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        renderRowActions={({ row }) => (
          <div className="flex items-center gap-1">
            <Tooltip title="Edit unverified song">
              <span>
                <Link
                  to={buildAdminUnverifiedSongProcessingUrl(row.original.sharedSongId)}
                  aria-label={`Edit ${row.original.title}`}>
                  <IconButton data-test="edit-unverified-song" data-song={row.original.sharedSongId}>
                    <Edit />
                  </IconButton>
                </Link>
              </span>
            </Tooltip>
            <Tooltip title="Delete unverified song">
              <IconButton
                data-test="delete-unverified-song"
                data-song={row.original.sharedSongId}
                aria-label={`Delete ${row.original.title}`}
                onClick={() => void handleDelete(row.original.sharedSongId)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </div>
        )}
      />
    </section>
  );
}
