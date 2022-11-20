import styled from '@emotion/styled';
import { Edit as EditIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import useSongIndex from 'hooks/songs/useSongIndex';
import { SongPreview } from 'interfaces';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';

interface Props {}

export default function SongList(props: Props) {
    const songList = useSongIndex();

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
                    <>
                        <IconButton
                            title="Edit the song"
                            href={`#/edit/${encodeURIComponent(row.original.file)}`}
                            data-test="edit-song"
                            data-song={row.original.file}>
                            <EditIcon />
                        </IconButton>
                    </>
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
