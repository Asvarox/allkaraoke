import { IconButton, Paper } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import posthog from 'posthog-js';
import { Helmet } from 'react-helmet';
import useSWR from 'swr';
import { Link } from 'wouter';

import { Icon } from '~/modules/elements/akui/icon';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useQueryParam from '~/modules/hooks/use-query-param';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import useSong from '~/modules/songs/hooks/use-song';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import SongDao from '~/modules/songs/songs-service';
import { getAdminPassword } from '~/routes/admin/admin-password';
import { BackgroundSavesIndicator } from '~/routes/admin/background-saves-indicator';
import { ReviewReasonTags } from '~/routes/admin/review-reason-tags';
import {
  getNextAdminReviewSongProcessingUrl,
  parseAdminReviewQueue,
} from '~/routes/admin/unverified-song-processing-queue';
import {
  ADMIN_REVIEW_SONGS_SWR_KEY,
  deleteAdminSongQualityFlag,
  deleteAdminUnverifiedSong,
  describeDurationShift,
  listAdminReviewSongs,
} from '~/routes/admin/unverified-songs-admin-api';
import { LazyConvert } from '~/routes/convert/convert';
import { useShareSongs } from '~/routes/edit/share-songs-modal';

dayjs.extend(relativeTime);

export default function Edit() {
  const { data } = useSongIndex(true);
  const [shareSongs] = useShareSongs(null);
  const songId = useQueryParam('song');
  const sharedSongId = useQueryParam('externalSong');
  const isAdminEdit = useQueryParam('admin') === 'true';
  const adminProcessingQueue = parseAdminReviewQueue(useQueryParam('processQueue'));
  const isAdminProcessingQueue = !!adminProcessingQueue;
  const navigate = useSmoothNavigate();
  useBackgroundMusic(false);
  const song = useSong(songId ?? '', {
    sourceType: sharedSongId ? 'unverified' : 'library',
    sharedSongId: sharedSongId ?? undefined,
  });

  const adminUnverifiedSongId = isAdminEdit && sharedSongId ? sharedSongId : undefined;
  const adminReportedSongId = isAdminEdit && !sharedSongId && songId ? songId : undefined;
  const adminReviewKey = adminUnverifiedSongId ?? adminReportedSongId;
  const { data: adminReviewSongs } = useSWR(
    adminReviewKey ? ([ADMIN_REVIEW_SONGS_SWR_KEY, getAdminPassword()] as const) : null,
    ([, password]) => listAdminReviewSongs(password),
    { keepPreviousData: true },
  );
  const adminReviewSong = adminReviewSongs?.find((reviewSong) => reviewSong.key === adminReviewKey);

  if (!song.data) return <>Loading</>;

  const returnLink = adminReviewKey ? 'admin/' : 'edit/list/';
  const returnLinkLabel = adminReviewKey ? 'Return to the unverified songs list' : 'Return to the song list';

  const getAdminProcessingQueueRedirect = async (password: string) => {
    const songs = await listAdminReviewSongs(password);

    return getNextAdminReviewSongProcessingUrl(songs, adminProcessingQueue!, adminReviewKey!);
  };

  const dismissAdminReports = async () => {
    if (!adminReportedSongId) return;
    if (!global.confirm('Dismiss the player reports for this song without changing it?')) return;

    try {
      const password = getAdminPassword();
      await deleteAdminSongQualityFlag(password, adminReportedSongId);
      navigate(isAdminProcessingQueue ? await getAdminProcessingQueueRedirect(password) : 'admin/');
    } catch (error) {
      global.alert(error instanceof Error ? error.message : 'Failed to dismiss the reports');
    }
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
      {adminReviewKey && <BackgroundSavesIndicator />}
      <div className="flex items-center justify-between gap-1 px-2 text-[14px]">
        <Link to={returnLink} asChild>
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
              <Icon icon="ic:baseline-delete" />
            </IconButton>
          )}
          {adminReportedSongId && (
            <IconButton
              title="Dismiss player reports"
              aria-label="Dismiss player reports"
              onClick={() => void dismissAdminReports()}
              data-test="dismiss-admin-song-reports">
              <Icon icon="ic:baseline-check" />
            </IconButton>
          )}
          {!adminReviewKey && song.data.local && (
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
              <Icon icon="ic:baseline-delete" />
            </IconButton>
          )}
        </span>
        <abbr title={song.data.lastUpdate}>
          Updated: <b>{song.data.lastUpdate ? dayjs(song.data.lastUpdate).fromNow() : '-'}</b>
        </abbr>
      </div>
      {adminReviewSong && (
        <div className="flex items-center gap-2 px-2 pt-2 text-[14px]" data-test="admin-review-song-reasons">
          <span>In the review queue because:</span>
          <ReviewReasonTags song={adminReviewSong} />
          {adminReviewSong.durationShift && (
            <span className="text-white/70">{describeDurationShift(adminReviewSong.durationShift)}</span>
          )}
        </div>
      )}
      <LazyConvert
        key={adminReviewKey ?? song.data.id}
        song={song.data}
        adminUnverifiedSongId={adminUnverifiedSongId}
        adminReportedSongId={adminReportedSongId}
      />
    </Paper>
  );
}
