import { Delete } from '@mui/icons-material';
import { IconButton, Paper } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import posthog from 'posthog-js';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useQueryParam from '~/modules/hooks/use-query-param';
import useSong from '~/modules/songs/hooks/use-song';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import SongDao from '~/modules/songs/songs-service';
import { LazyConvert } from '~/routes/convert/convert';
import { useShareSongs } from '~/routes/edit/share-songs-modal';

dayjs.extend(relativeTime);

export default function Edit() {
  const { data } = useSongIndex(true);
  const [shareSongs] = useShareSongs(null);
  const songId = useQueryParam('song');
  const externalSongId = useQueryParam('externalSong');
  const isAdminEdit = useQueryParam('admin') === 'true';
  useBackgroundMusic(false);
  const song = useSong(songId ?? '', {
    sourceType: externalSongId ? 'shared' : 'library',
    externalSongId: externalSongId ?? undefined,
  });

  if (!song.data) return <>Loading</>;

  return (
    <Paper elevation={2} sx={{ minHeight: '100vh', maxWidth: '1260px', margin: '0 auto' }} className="pt-4 md:pt-8">
      <Helmet>
        <title>Edit Song | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <div className="flex items-center justify-between gap-1 px-2 text-[14px]">
        <Link to="edit/list/">
          <a>Return to the song list</a>
        </Link>
        <span data-test="edit-song-heading">
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
          Updated: <b>{song.data.lastUpdate ? dayjs(song.data.lastUpdate).fromNow() : '-'}</b>
        </abbr>
      </div>
      <LazyConvert
        song={song.data}
        adminSharedSongExternalId={isAdminEdit && externalSongId ? externalSongId : undefined}
      />
    </Paper>
  );
}
