import styled from '@emotion/styled';
import { Delete, Download, Edit as EditIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, FormControlLabel, IconButton, Switch } from '@mui/material';
import posthog from 'posthog-js';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { useBackground } from '~/modules/elements/background-context';
import NoPrerender from '~/modules/elements/no-prerender';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useQueryParam from '~/modules/hooks/use-query-param';
import { buildUrl } from '~/modules/hooks/use-smooth-navigate';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import SongDao from '~/modules/songs/songs-service';
import convertSongToTxt from '~/modules/songs/utils/convert-song-to-txt';
import SongsTable from '~/routes/edit/components/songs-table';
import ShareSongsModal, { useShareSongs } from '~/routes/edit/share-songs-modal';

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

          <div className="grid grid-cols-12 items-center gap-y-4">
            <div className="col-span-3 flex items-center justify-start">
              <Link to="menu/">
                <Button data-test="main-menu-link">Return to main menu</Button>
              </Link>
            </div>
            <div className="col-span-6 flex items-center justify-center">
              <h4>
                <span
                  onClick={() => {
                    window.__exposeSingletons();
                    window.__singletons.importSongs();
                  }}>
                  {data.length}
                </span>{' '}
                songs
              </h4>
            </div>
            <div className="col-span-3 flex items-center justify-end">
              <Link to="convert/">
                <Button data-test="convert-song" variant={'contained'}>
                  Import UltraStar .TXT
                </Button>
              </Link>
            </div>
            <div className="col-span-12">
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
            </div>
            {shareSongs !== null && (
              <div className="col-span-12">
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
              </div>
            )}
          </div>
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
