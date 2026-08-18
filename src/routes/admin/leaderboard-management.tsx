import { Alert, IconButton, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { Icon } from '~/modules/elements/akui/icon';
import { AdminBoardEntry } from '~/modules/leaderboard/types';

import { deleteAdminLeaderboardEntry, listAdminLeaderboardEntries } from './leaderboard-admin-api';

interface Props {
  password: string;
}

const columns: MRT_ColumnDef<AdminBoardEntry>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'country', header: 'Country' },
  { accessorKey: 'score', header: 'Score', Cell: ({ cell }) => Math.round(cell.getValue<number>()).toLocaleString() },
  { accessorKey: 'artist', header: 'Artist' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'tolerance', header: 'Tolerance' },
  {
    accessorKey: 'createdAt',
    header: 'Submitted',
    Cell: ({ cell }) => <span>{dayjs(cell.getValue<number>()).format('MMM DD YYYY, HH:mm')}</span>,
  },
];

/**
 * Manual row deletion is the only recourse against a filled-up board in v1 — see the design doc's
 * "Abuse Posture". Deleting rebuilds the public KV projection server-side.
 */
export function LeaderboardManagement({ password }: Props) {
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR(['leaderboard-admin', password], () =>
    listAdminLeaderboardEntries(password),
  );

  const tableColumns = useMemo(() => columns, []);

  const remove = async (entry: AdminBoardEntry) => {
    setError(null);

    try {
      await deleteAdminLeaderboardEntry(password, entry.id);
      await mutate();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete the record');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert severity="error">{error}</Alert>}
      <MaterialReactTable
        columns={tableColumns}
        data={data ?? []}
        state={{ isLoading }}
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Tooltip title="Delete record">
            <IconButton color="error" onClick={() => remove(row.original)} data-test="delete-leaderboard-entry">
              <Icon icon="ic:baseline-delete" />
            </IconButton>
          </Tooltip>
        )}
      />
    </div>
  );
}
