import styled from '@emotion/styled';
import { Delete, Download, Edit as EditIcon } from '@mui/icons-material';
import { Button, Grid, IconButton } from '@mui/material';
import useSongIndex from 'Songs/hooks/useSongIndex';
import { SongPreview } from 'interfaces';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';
import SongDao from 'Songs/SongDao';
import convertSongToTxt from 'Songs/utils/convertSongToTxt';

interface Props {}

export default function SongList(props: Props) {
    const { data, reload } = useSongIndex();

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
    if (!data) return <>Loading</>;

    return (
        <Container>
            <Grid container>
                <Grid item xs={6}>
                    <h3>{data.length} songs</h3>
                </Grid>
                <Grid item xs={6} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                    <Button href={'#/convert'} data-test="convert-song" variant={'contained'}>
                        Import UltraStar .TXT
                    </Button>
                </Grid>
            </Grid>

            <MaterialReactTable
                data={data}
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
                        <IconButton
                            title="Download .txt file"
                            onClick={async () => {
                                const songData = await SongDao.get(row.original.file);
                                const txt = convertSongToTxt(songData);

                                const anchor = document.createElement('a');
                                anchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(txt)}`;
                                anchor.download = `${row.original.artist} - ${row.original.title}.txt`;
                                document.body.appendChild(anchor);
                                anchor.click();
                                document.body.removeChild(anchor);
                            }}
                            data-test="download-song"
                            data-song={row.original.file}>
                            <Download />
                        </IconButton>
                        <IconButton
                            title="Delete the song"
                            onClick={async () => {
                                await SongDao.softDeleteSong(row.original.file);
                                reload();
                            }}
                            data-test="delete-song"
                            data-song={row.original.file}>
                            <Delete />
                        </IconButton>
                    </>
                )}
                initialState={{ density: 'compact' }}
                enableDensityToggle={false}
                enableFullScreenToggle={false}
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
