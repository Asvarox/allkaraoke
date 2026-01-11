import styled from '@emotion/styled';
import { Delete } from '@mui/icons-material';
import { IconButton, Paper } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import posthog from 'posthog-js';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import SongDao from '~/modules/Songs/SongsService';
import useSong from '~/modules/Songs/hooks/useSong';
import useSongIndex from '~/modules/Songs/hooks/useSongIndex';
import useBackgroundMusic from '~/modules/hooks/useBackgroundMusic';
import useQueryParam from '~/modules/hooks/useQueryParam';
import { LazyConvert } from '~/routes/Convert/Convert';
import { useShareSongs } from '~/routes/Edit/ShareSongsModal';

dayjs.extend(relativeTime);

export default function Edit() {
  const { data } = useSongIndex(true);
  const [shareSongs] = useShareSongs(null);
  const songId = useQueryParam('song');
  useBackgroundMusic(false);
  const song = useSong(songId ?? '');

  if (!song.data) return <>Loading</>;

  return (
    <Paper elevation={2} sx={{ minHeight: '100vh', maxWidth: '1260px', margin: '0 auto', paddingTop: '30px' }}>
      <Helmet>
        <title>Edit Song | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <TopBar>
        <Link to="edit/list/">
          <a>Return to the song list</a>
        </Link>
        <span>
          Editing:{' '}
          <b>
            {song.data.artist} - {song.data.title}
          </b>
          {song.data.local && (
            <IconButton
              title="Delete the song"
              onClick={async () => {
                const proceed = global.confirm(`Are you sure you want to delete this song?`);

                if (proceed) {
                  await SongDao.deleteSong(song.data!.id);

                  if (shareSongs && data.some((songInIndex) => songInIndex.id === song.data!.id)) {
                    posthog.capture('unshare-song', { songId: song.data!.id });
                  }
                }
              }}
              data-test="delete-song">
              <Delete />
            </IconButton>
          )}
        </span>
        <abbr title={song.data.lastUpdate}>
          Last updated: <b>{song.data.lastUpdate ? dayjs(song.data.lastUpdate).fromNow() : '-'}</b>
        </abbr>
      </TopBar>
      <LazyConvert song={song.data} />
    </Paper>
  );
}

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 8px;
`;
