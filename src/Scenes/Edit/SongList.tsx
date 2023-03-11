import styled from '@emotion/styled';
import { DataObject, Delete, Download, Edit as EditIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Grid, IconButton } from '@mui/material';
import useSongIndex from 'Songs/hooks/useSongIndex';
import { SongPreview } from 'interfaces';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import React, { useMemo } from 'react';
import SongDao from 'Songs/SongDao';
import convertSongToTxt from 'Songs/utils/convertSongToTxt';
import NormalizeFontSize from 'Elements/NormalizeFontSize';
import { Link } from 'wouter';
import { format } from 'date-fns';
import useBackgroundMusic from 'hooks/useBackgroundMusic';

interface Props {}

export default function SongList(props: Props) {
    useBackgroundMusic(false);
    const { data, reload } = useSongIndex(true);

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
                size: 100,
            },
            {
                accessorKey: 'language',
                header: 'Language',
                size: 100,
            },
            {
                accessorKey: 'lastUpdate',
                header: 'Last Update',
                Cell: ({ cell }) => {
                    const val = cell.getValue<string>();

                    return val && <abbr title={val}>{format(new Date(val), 'LLL do y')}</abbr>;
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
        ],
        [],
    );
    if (!data) return <>Loading</>;

    return (
        <Container>
            <NormalizeFontSize />
            <Grid container>
                <Grid item xs={3}>
                    <Link to="/">
                        <a>Return to main menu</a>
                    </Link>
                </Grid>
                <Grid item xs={3}>
                    <h3>{data.length} songs</h3>
                </Grid>
                <Grid item xs={6} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                    <Link to="/convert">
                        <Button data-test="convert-song" variant={'contained'}>
                            Import UltraStar .TXT
                        </Button>
                    </Link>
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
                            href={`/edit/${encodeURIComponent(row.original.file)}`}
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
                                anchor.href = `data:plain/text;charset=utf-8,${encodeURIComponent(txt)}`;
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
                            title="Download .json file"
                            onClick={async () => {
                                const songData = await SongDao.get(row.original.file);
                                const json = JSON.stringify(songData, undefined, 2);

                                const anchor = document.createElement('a');
                                anchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
                                anchor.download = `${row.original.artist}-${row.original.title}.json`;
                                document.body.appendChild(anchor);
                                anchor.click();
                                document.body.removeChild(anchor);
                            }}
                            data-test="download-song-json"
                            data-song={row.original.file}>
                            <DataObject />
                        </IconButton>
                        {!row.original.isDeleted && (
                            <IconButton
                                title="Hide the song"
                                onClick={async () => {
                                    await SongDao.softDeleteSong(row.original.file);
                                    reload();
                                }}
                                data-test="hide-song"
                                data-song={row.original.file}>
                                <VisibilityOff />
                            </IconButton>
                        )}
                        {row.original.isDeleted && (
                            <IconButton
                                title="Restore the song"
                                onClick={async () => {
                                    await SongDao.restoreSong(row.original.file);
                                    reload();
                                }}
                                data-test="restore-song"
                                data-song={row.original.file}>
                                <Visibility />
                            </IconButton>
                        )}
                        <IconButton
                            title="Delete the song"
                            onClick={async () => {
                                const proceed = window.confirm(`Are you sure you want to delete this song?`);

                                if (proceed) {
                                    await SongDao.deleteSong(row.original.file);
                                    reload();
                                }
                            }}
                            data-test="delete-song"
                            disabled={!row.original.local}
                            data-song={row.original.file}>
                            <Delete />
                        </IconButton>
                    </>
                )}
                initialState={{ density: 'compact', columnVisibility: { local: false, isDeleted: false } }}
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
    padding: 60px 20px 0 20px;
`;
