import { Button } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import useSongIndex from '~/modules/Songs/hooks/useSongIndex';
import useBackgroundMusic from '~/modules/hooks/useBackgroundMusic';
import useQueryParam from '~/modules/hooks/useQueryParam';
import useSmoothNavigate, { buildUrl } from '~/modules/hooks/useSmoothNavigate';
import { useShareSongs } from '~/routes/Edit/ShareSongsModal';

export default function RedirectToFirstLocalSong() {
  const [, setShareSongs] = useShareSongs();
  const navigate = useSmoothNavigate();
  const { data, isLoading } = useSongIndex(true);
  const previousSongId = useQueryParam('previousSongId');
  useBackgroundMusic(false);

  const song = useMemo(() => {
    if (data.length) {
      return data
        .filter((s) => !s.isBuiltIn)
        .sort((a, b) => dayjs(a.lastUpdate).diff(dayjs(b.lastUpdate)))
        .filter((s) => s.id !== previousSongId)[0];
    }
    return null;
  }, [data, previousSongId]);

  const navigateToSong = () => {
    navigate(
      buildUrl(`edit/song/`, {
        manual: null,
        song: song?.id ?? '',
        id: null,
        step: 'sync',
        redirect: 'edit/redirect-to-first-local-song',
      }),
    );
  };

  useEffect(() => {
    if (song) {
      setShareSongs(true);
      navigateToSong();
    }
  }, [song]);

  if (isLoading) return <>Loading...</>;
  if (!song) return <>No local songs found.</>;

  return <Button onClick={navigateToSong}>Go to the first local song</Button>;
}
