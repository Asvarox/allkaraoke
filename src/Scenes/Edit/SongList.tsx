import styled from '@emotion/styled';
import { Edit as EditIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { SongPreview } from 'interfaces';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

interface Props {}

export default function SongList(props: Props) {
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );

    const columns: MRT_ColumnDef<SongPreview>[] = useMemo(
        () => [
            {
                accessorKey: 'artist',
                header: 'Artist',
            },
            {
                accessorKey: 'title',
                header: 'Title',
            },
            {
                accessorKey: 'year',
                header: 'Year',
            },
            {
                accessorKey: 'language',
                header: 'Language',
            },
        ],
        [],
    );
    if (!songList.data) return <>Loading</>;

    return (
        <Container>
            <h3>{songList.data.length} songs</h3>

            <MaterialReactTable
                data={songList.data}
                columns={columns}
                getRowId={(song) => song.file}
                positionActionsColumn="last"
                enableRowActions
                renderRowActions={({ row }) => (
                    <IconButton href={`#/edit/${encodeURIComponent(row.original.file)}`}>
                        <EditIcon />
                    </IconButton>
                )}
                initialState={{ density: 'compact' }}
                enableDensityToggle={false}
                enableFullScreenToggle={false}
                enablePagination={false}
            />
        </Container>
    );
}

const Container = styled.div`
    margin: 0 auto;
    height: 100%;
    width: 1260px;
    background: white;
    padding: 20px;
`;
