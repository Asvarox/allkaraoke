import styled from '@emotion/styled';
import { Delete, Download, Edit as EditIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, FormControlLabel, Grid, IconButton, Switch } from '@mui/material';
import { useBackground } from 'modules/Elements/BackgroundContext';
import NoPrerender from 'modules/Elements/NoPrerender';
import NormalizeFontSize from 'modules/Elements/NormalizeFontSize';
import SongDao from 'modules/Songs/SongsService';
import useSongIndex from 'modules/Songs/hooks/useSongIndex';
import convertSongToTxt from 'modules/Songs/utils/convertSongToTxt';
import useBackgroundMusic from 'modules/hooks/useBackgroundMusic';
import useQueryParam from 'modules/hooks/useQueryParam';
import { buildUrl } from 'modules/hooks/useSmoothNavigate';
import posthog from 'posthog-js';
import { Helmet } from 'react-helmet';
import SongsTable from 'routes/Edit/Components/SongsTable';
import ShareSongsModal, { useShareSongs } from 'routes/Edit/ShareSongsModal';
import { Link } from 'wouter';

export default function SongList() {
  useBackground(false);
  useBackgroundMusic(false);
  const { data, reload } = useSongIndex(true);
  const [shareSongs, setShareSongs] = useShareSongs(null);

  const created = useQueryParam('created');
  const songId = useQueryParam('id');

  if (!data) return <>Loading</>;

  return (
    <>
      <Helmet>
        <title>Song List | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <NoPrerender>
        <Container>
          {created && <ShareSongsModal id={songId} />}
          <NormalizeFontSize />
          <Grid container rowGap={2}>
            <Grid item xs={3} display={'flex'} alignItems={'center'} justifyContent={'flex-start'}>
              <Link to="menu/">
                <Button data-test="main-menu-link">Return to main menu</Button>
              </Link>
            </Grid>
            <Grid item xs={6} display="flex" alignItems="center" justifyContent="center">
              <h4>
                <span
                  onClick={() => {
                    window.__exposeSingletons();
                    window.__singletons.importSongs();
                  }}>
                  {data.length}
                </span>{' '}
                <Link to="edit/redirect-to-first-local-song">
                  <span>songs</span>
                </Link>
              </h4>
            </Grid>
            <Grid item xs={3} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
              <Link to="convert/">
                <Button data-test="convert-song" variant={'contained'}>
                  Import UltraStar .TXT
                </Button>
              </Link>
            </Grid>
            <Grid item xs={12}>
              <SongsTable
                globalFilter={songId}
                data={data}
                renderRowActions={({ row }) => (
                  <>
                    <Link to={buildUrl(`edit/song/`, { song: row.original.id, id: null })}>
                      <IconButton title="Edit the song" data-test="edit-song" data-song={row.original.id}>
                        <EditIcon />
                      </IconButton>
                    </Link>
                    <IconButton
                      title="Download .txt file"
                      onClick={async () => {
                        const songData = await SongDao.get(row.original.id);
                        const txt = convertSongToTxt(songData);

                        const anchor = document.createElement('a');
                        anchor.href = `data:plain/text;charset=utf-8,${encodeURIComponent(txt)}`;
                        anchor.download = `${SongDao.generateSongFile(songData)}.txt`;
                        document.body.appendChild(anchor);
                        anchor.click();
                        document.body.removeChild(anchor);
                      }}
                      data-test="download-song"
                      data-song={row.original.id}>
                      <Download />
                    </IconButton>
                    {!row.original.isDeleted && (
                      <IconButton
                        title="Hide the song"
                        onClick={async () => {
                          await SongDao.softDeleteSong(row.original.id);
                          reload();
                        }}
                        data-test="hide-song"
                        data-song={row.original.id}>
                        <Visibility />
                      </IconButton>
                    )}
                    {row.original.isDeleted && (
                      <IconButton
                        title="Restore the song"
                        onClick={async () => {
                          await SongDao.restoreSong(row.original.id);
                          reload();
                        }}
                        data-test="restore-song"
                        data-song={row.original.id}>
                        <VisibilityOff />
                      </IconButton>
                    )}
                    <IconButton
                      className={!row.original.local ? 'cursor-default! opacity-50' : ''}
                      title="Delete the song"
                      onClick={async () => {
                        const proceed = global.confirm(`Are you sure you want to delete this song?`);

                        if (proceed) {
                          await SongDao.deleteSong(row.original.id);

                          if (shareSongs && data.some((song) => song.id === row.original.id)) {
                            posthog.capture('unshare-song', { songId: row.original.id });
                          }

                          reload();
                        }
                      }}
                      data-test="delete-song"
                      data-song={row.original.id}>
                      <Delete />
                    </IconButton>
                  </>
                )}
              />
            </Grid>
            {shareSongs !== null && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      defaultChecked
                      checked={shareSongs}
                      onChange={(e) => setShareSongs(e.target.checked)}
                      data-test="share-songs-switch"
                    />
                  }
                  label="Share added songs (so they can be played by others)"
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </NoPrerender>
    </>
  );
}

const Container = styled.div`
  margin: 0 auto;
  height: 100%;
  width: 1260px;
  background: white;
  padding: 60px 20px 0 20px;
`;
