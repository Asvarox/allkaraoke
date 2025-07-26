import dayjs from 'dayjs';
import useSongIndex from 'modules/Songs/hooks/useSongIndex';
import useBackgroundMusic from 'modules/hooks/useBackgroundMusic';
import useSmoothNavigate, { buildUrl } from 'modules/hooks/useSmoothNavigate';
import { useEffect, useMemo } from 'react';

export default function RedirectToFirstLocalSong() {
  const navigate = useSmoothNavigate();
  const { data, isLoading } = useSongIndex(true);
  useBackgroundMusic(false);

  const song = useMemo(() => {
    if (data.length) {
      return data.filter((s) => !s.isBuiltIn).sort((a, b) => dayjs(a.lastUpdate).diff(dayjs(b.lastUpdate)))[0];
    }
    return null;
  }, [data]);

  useEffect(() => {
    if (song) {
      navigate(
        buildUrl(`edit/song/`, {
          song: song.id,
          id: null,
          step: 'sync',
          redirect: 'edit/redirect-to-first-local-song',
        }),
      );
    }
  }, [song]);

  if (isLoading) return <>Loading...</>;
  if (!song) return <>No local songs found.</>;

  return null;
}
