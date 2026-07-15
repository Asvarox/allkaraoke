import { Delete } from '@mui/icons-material';
import { IconButton, Paper } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import posthog from 'posthog-js';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';

import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useQueryParam from '~/modules/hooks/use-query-param';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import useSong from '~/modules/songs/hooks/use-song';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import SongDao from '~/modules/songs/songs-service';
import { getAdminPassword } from '~/routes/admin/admin-password';
import { getNextAdminUnverifiedSongProcessingUrl } from '~/routes/admin/unverified-song-processing-queue';
import { deleteAdminUnverifiedSong, listAdminUnverifiedSongs } from '~/routes/admin/unverified-songs-admin-api';
import { LazyConvert } from '~/routes/convert/convert';
import { useShareSongs } from '~/routes/edit/share-songs-modal';

dayjs.extend(relativeTime);

export default function Edit() {
  const { data } = useSongIndex(true);
  const [shareSongs] = useShareSongs(null);
  const songId = useQueryParam('song');
  const sharedSongId = useQueryParam('externalSong');
  const isAdminEdit = useQueryParam('admin') === 'true';
  const isAdminProcessingQueue = useQueryParam('processQueue') === 'true';
  const navigate = useSmoothNavigate();
  useBackgroundMusic(false);
  const song = useSong(songId ?? '', {
    sourceType: sharedSongId ? 'unverified' : 'library',
    sharedSongId: sharedSongId ?? undefined,
  });

  if (!song.data) return <>Loading</>;

  const adminUnverifiedSongId = isAdminEdit && sharedSongId ? sharedSongId : undefined;
  const returnLink = adminUnverifiedSongId ? 'admin/' : 'edit/list/';
  const returnLinkLabel = adminUnverifiedSongId ? 'Return to the unverified songs list' : 'Return to the song list';

  const getAdminProcessingQueueRedirect = async (password: string) => {
    const songs = await listAdminUnverifiedSongs(password);

    return getNextAdminUnverifiedSongProcessingUrl(songs, adminUnverifiedSongId!);
  };

  const deleteAdminSong = async () => {
    if (!adminUnverifiedSongId) return;
    const proceed = global.confirm('Remove this unverified song from Cloudflare KV?');

    if (!proceed) return;

    try {
      const password = getAdminPassword();

      if (isAdminProcessingQueue) {
        await deleteAdminUnverifiedSong(password, adminUnverifiedSongId);
        const nextUrl = await getAdminProcessingQueueRedirect(password);
        navigate(nextUrl);
        return;
      }

      await deleteAdminUnverifiedSong(password, adminUnverifiedSongId);
      navigate('admin/');
    } catch (error) {
      global.alert(error instanceof Error ? error.message : 'Failed to delete unverified song');
    }
  };

  return (
    <Paper elevation={2} sx={{ minHeight: '100vh', maxWidth: '1260px', margin: '0 auto' }} className="pt-4 md:pt-8">
      <Helmet>
        <title>Edit Song | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <div className="flex items-center justify-between gap-1 px-2 text-[14px]">
        <Link to={returnLink}>
          <a>{returnLinkLabel}</a>
        </Link>
        <span data-test="edit-song-heading">
          <b>
            {song.data.artist} - {song.data.title}
          </b>
          {adminUnverifiedSongId && (
            <IconButton
              title="Delete unverified song"
              aria-label="Delete unverified song"
              onClick={() => void deleteAdminSong()}
              data-test="delete-admin-unverified-song">
              <Delete />
            </IconButton>
          )}
          {!adminUnverifiedSongId && song.data.local && (
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
        key={adminUnverifiedSongId ?? song.data.id}
        song={song.data}
        adminUnverifiedSongId={adminUnverifiedSongId}
      />
    </Paper>
  );
}
