import { Alert, Button, IconButton, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_SortingState,
} from 'material-react-table';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Link } from 'wouter';

import { Icon } from '~/modules/elements/akui/icon';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { getUnverifiedSongById } from '~/modules/songs/unverified-songs/api';

import { BackgroundSavesIndicator } from './background-saves-indicator';
import { useAdminUnverifiedSongSaves } from './background-song-save';
import { RegenerateIndexButton } from './regenerate-index-button';
import { ReviewReasonTags } from './review-reason-tags';
import {
  AdminReviewQueue,
  buildAdminReviewSongProcessingUrl,
  countAdminReviewQueueSongs,
  getRandomAdminReviewSong,
} from './unverified-song-processing-queue';
import {
  ADMIN_REVIEW_SONGS_SWR_KEY,
  AdminReviewSong,
  deleteAdminSongQualityFlag,
  deleteAdminUnverifiedSong,
  listAdminReviewSongs,
  regenerateAdminUnverifiedSongsIndex,
} from './unverified-songs-admin-api';

interface Props {
  password: string;
}

const DEFAULT_PAGE_SIZE = 10;
const UNVERIFIED_SONGS_TABLE_PAGE_SIZE_STORAGE_KEY = 'admin-unverified-songs-table-page-size';
const UNVERIFIED_SONGS_TABLE_SORTING_STORAGE_KEY = 'admin-unverified-songs-table-sorting';

const columns: MRT_ColumnDef<AdminReviewSong>[] = [
  {
    accessorFn: (song) => song.reasons.join(', '),
    id: 'reasons',
    header: 'Reason',
    Cell: ({ row }) => <ReviewReasonTags song={row.original} />,
  },
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
  const unverifiedSongsKey = password ? ([ADMIN_REVIEW_SONGS_SWR_KEY, password] as const) : null;
  const {
    data: songs = [],
    error: listError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(unverifiedSongsKey, ([, adminPassword]) => listAdminReviewSongs(adminPassword), {
    keepPreviousData: true,
  });

  const {
    trigger: deleteSong,
    error: deleteError,
    isMutating: isDeleting,
    reset: resetDeleteError,
  } = useSWRMutation(
    unverifiedSongsKey,
    ([, adminPassword], { arg: song }: { arg: AdminReviewSong }) =>
      song.sharedSongId
        ? deleteAdminUnverifiedSong(adminPassword, song.sharedSongId)
        : deleteAdminSongQualityFlag(adminPassword, song.songId),
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

  const { pending: pendingSaves } = useAdminUnverifiedSongSaves();
  const previousPendingSavesCount = useRef(pendingSaves.length);

  useEffect(() => {
    const hadPendingSaves = previousPendingSavesCount.current > 0;
    previousPendingSavesCount.current = pendingSaves.length;

    // Background saves change the songs in KV, so refresh the list once they are done.
    if (hadPendingSaves && pendingSaves.length === 0) {
      void mutate();
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSaves.length]);

  const startQueue = (queue: AdminReviewQueue) => {
    const songToProcess = getRandomAdminReviewSong(songs, queue);

    if (songToProcess) {
      navigate(buildAdminReviewSongProcessingUrl(songToProcess, queue));
    }
  };
  const unverifiedCount = songs.filter((song) => song.reasons.includes('unverified')).length;
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

  const handleDelete = async (song: AdminReviewSong) => {
    const message = song.sharedSongId
      ? 'Remove this unverified song from Cloudflare KV?'
      : 'Dismiss the player reports for this song?';
    if (!global.confirm(message)) return;

    resetRegenerateError();

    try {
      await deleteSong(song);
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

  const handleDownload = async (sharedSongId: string, song: AdminReviewSong) => {
    const { songTxt } = await getUnverifiedSongById(sharedSongId);

    const anchor = document.createElement('a');
    anchor.href = `data:plain/text;charset=utf-8,${encodeURIComponent(songTxt)}`;
    anchor.download = `${song.songId}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <section className="flex flex-col gap-2">
      <BackgroundSavesIndicator />
      <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg!">Unverified Songs Management</h1>
          <p className="mt-1 text-sm">
            {unverifiedCount} unverified songs and {songs.length - unverifiedCount} songs reported by players in
            Cloudflare KV
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="contained"
            data-test="process-unverified-songs"
            onClick={() => startQueue('unverified')}
            disabled={isBusy || !countAdminReviewQueueSongs(songs, 'unverified')}>
            Process random unverified
          </Button>
          <Button
            variant="contained"
            data-test="process-reported-songs"
            onClick={() => startQueue('reports')}
            disabled={isBusy || !countAdminReviewQueueSongs(songs, 'reports')}>
            Process random reported
          </Button>
          <RegenerateIndexButton disabled={isBusy} onRegenerate={() => void handleRegenerateIndex()} />
          <Button
            startIcon={<Icon icon="ic:baseline-refresh" />}
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
        getRowId={(song) => song.key}
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
        renderRowActions={({ row }) => {
          const { sharedSongId } = row.original;

          return (
            <div className="flex items-center gap-1">
              <Tooltip title={sharedSongId ? 'Edit unverified song' : 'Edit reported song'}>
                <span>
                  <Link
                    to={buildAdminReviewSongProcessingUrl(row.original)}
                    aria-label={`Edit ${row.original.title}`}
                    asChild>
                    <IconButton data-test="edit-unverified-song" data-song={row.original.key}>
                      <Icon icon="ic:baseline-edit" />
                    </IconButton>
                  </Link>
                </span>
              </Tooltip>
              {sharedSongId && (
                <Tooltip title="Download .txt file">
                  <IconButton
                    data-test="download-unverified-song"
                    data-song={sharedSongId}
                    aria-label={`Download ${row.original.title}`}
                    onClick={() => void handleDownload(sharedSongId, row.original)}>
                    <Icon icon="ic:baseline-download" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={sharedSongId ? 'Delete unverified song' : 'Dismiss player reports'}>
                <IconButton
                  data-test={sharedSongId ? 'delete-unverified-song' : 'dismiss-song-reports'}
                  data-song={row.original.key}
                  aria-label={`${sharedSongId ? 'Delete' : 'Dismiss reports for'} ${row.original.title}`}
                  onClick={() => void handleDelete(row.original)}>
                  <Icon icon={sharedSongId ? 'ic:baseline-delete' : 'ic:baseline-check'} />
                </IconButton>
              </Tooltip>
            </div>
          );
        }}
      />
    </section>
  );
}
