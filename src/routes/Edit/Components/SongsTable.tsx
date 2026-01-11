import { Checkbox } from '@mui/material';
import dayjs from 'dayjs';
import { MaterialReactTable, MaterialReactTableProps, MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';
import { Link } from 'wouter';
import { SongPreview } from '~/interfaces';
import { buildUrl } from '~/modules/hooks/useSmoothNavigate';

interface Props {
  globalFilter?: string | null;
  data: SongPreview[];
  selectable?: boolean;
  selectedSongs?: number[];
  onSelect?: (selected: number[]) => void;
  renderRowActions?: MaterialReactTableProps<SongPreview>['renderRowActions'];
}

export default function SongsTable({
  data,
  selectable,
  onSelect,
  selectedSongs = [],
  renderRowActions,
  globalFilter,
}: Props) {
  const columns = useMemo(() => {
    const columnsDef: MRT_ColumnDef<SongPreview>[] = [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'artist',
        header: 'Artist',
      },
      {
        accessorKey: 'title',
        header: 'Title',
        Cell: ({ renderedCellValue, row }) => (
          <Link to={buildUrl(`game/`, { song: row.original.id, playlist: 'All' })}>{renderedCellValue}</Link>
        ),
      },
      {
        accessorKey: 'year',
        header: 'Year',
        size: 100,
      },
      {
        accessorKey: 'language',
        header: 'Language',
        size: 100,
      },
      {
        accessorKey: 'video',
        header: 'Video',
        size: 100,
      },
      {
        accessorKey: 'lastUpdate',
        header: 'Last Update',
        sortUndefined: -1 as -1,
        Cell: ({ cell }) => {
          const val = cell.getValue<string>();

          return val && <span>{dayjs(val).format('MMM DD YYYY, HH:mm')}</span>;
        },
      },
      {
        accessorKey: 'local',
        header: 'Local',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? `✔️` : ''),
      },
      {
        accessorKey: 'isDeleted',
        header: 'Deleted',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? `✔️` : ''),
        size: 100,
      },
    ];

    if (selectable) {
      columnsDef.unshift({
        accessorKey: 'shortId',
        header: '',
        enableColumnFilter: false,
        enableGlobalFilter: false,
        enableSorting: false,
        enableHiding: false,
        size: 20,
        Cell: ({ row }) => {
          const isSelected = selectedSongs.includes(row.original.shortId);
          return (
            <Checkbox
              data-test={'toggle-selection'}
              data-song={row.original.id}
              size="small"
              onClick={() =>
                onSelect?.(
                  isSelected
                    ? selectedSongs.filter((sId) => sId !== row.original.shortId)
                    : [...selectedSongs, row.original.shortId],
                )
              }
              checked={isSelected}
            />
          );
        },
      });
    }

    return columnsDef;
  }, [selectable, onSelect, selectedSongs]);
  if (!data) return <>Loading</>;

  return (
    <MaterialReactTable
      data={data}
      columns={columns}
      getRowId={(song) => song.id}
      positionActionsColumn="last"
      enableRowActions
      renderRowActions={renderRowActions}
      initialState={{
        density: 'compact',
        columnVisibility: { local: false, isDeleted: false, video: false, id: false },
        globalFilter,
        showGlobalFilter: true,
      }}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
    />
  );
}
