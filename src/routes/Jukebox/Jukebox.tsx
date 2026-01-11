import { shuffle } from 'es-toolkit';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { SongPreview } from '~/interfaces';
import { useBackground } from '~/modules/Elements/BackgroundContext';
import { Button } from '~/modules/Elements/Button';
import NoPrerender from '~/modules/Elements/NoPrerender';
import SmoothLink from '~/modules/Elements/SmoothLink';
import VideoPlayer, { VideoState } from '~/modules/Elements/VideoPlayer';
import useSongIndex from '~/modules/Songs/hooks/useSongIndex';
import useBackgroundMusic from '~/modules/hooks/useBackgroundMusic';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import useSmoothNavigate, { buildUrl } from '~/modules/hooks/useSmoothNavigate';
import useViewportSize from '~/modules/hooks/useViewportSize';
import LayoutGame from '~/routes/LayoutGame';
import SongPage from '../Game/SongPage';

function Jukebox() {
  useBackground(false);
  useBackgroundMusic(false);
  const navigate = useSmoothNavigate();
  const { width, height } = useViewportSize();
  const [currentlyPlaying, setCurrentlyPlaying] = useState(0);
  const songList = useSongIndex();

  const [shuffledList, setShuffledList] = useState<SongPreview[]>([]);
  const { register } = useKeyboardNav({ onBackspace: () => navigate('menu/') });

  useEffect(() => songList.data && setShuffledList(shuffle(songList.data)), [songList.data]);

  const playNext = () => songList.data && setCurrentlyPlaying((current) => (current + 1) % songList.data.length);

  if (!shuffledList.length || !width || !height) return null;

  const navigateUrl = buildUrl(`game/`, { song: shuffledList[currentlyPlaying].id, playlist: 'All' });

  return (
    <LayoutGame>
      <Helmet>
        <title>Jukebox | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <NoPrerender>
        <SongPage
          width={width}
          height={height}
          songData={shuffledList[currentlyPlaying]}
          data-test="jukebox-container"
          data-song={shuffledList[currentlyPlaying].id}
          background={
            <VideoPlayer
              autoplay
              controls
              width={width}
              height={height}
              volume={shuffledList[currentlyPlaying]?.volume}
              video={shuffledList[currentlyPlaying].video}
              startAt={shuffledList[currentlyPlaying].videoGap}
              onStateChange={(state) => {
                if (state === VideoState.ENDED) playNext();
              }}
            />
          }>
          <Button {...register('skip-button', playNext)} className="absolute right-0 bottom-44 px-20">
            Skip
          </Button>
          <SmoothLink to={navigateUrl}>
            <Button
              {...register('sing-button', () => navigate(navigateUrl), undefined, true)}
              className="absolute right-0 bottom-16 px-20">
              Sing this song
            </Button>
          </SmoothLink>
        </SongPage>
      </NoPrerender>
    </LayoutGame>
  );
}

export default Jukebox;
