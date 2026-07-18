import { shuffle } from 'es-toolkit';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { SongPreview } from '~/interfaces';
import { Button } from '~/modules/elements/akui/button';
import { useBackground } from '~/modules/elements/background-context';
import NoPrerender from '~/modules/elements/no-prerender';
import SmoothLink from '~/modules/elements/smooth-link';
import VideoPlayer, { VideoState } from '~/modules/elements/video-player/index';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate, { buildUrl } from '~/modules/hooks/use-smooth-navigate';
import useViewportSize from '~/modules/hooks/use-viewport-size';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import LayoutGame from '~/routes/layout-game';

import SongPage from '../game/song-page';

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
          <div className="absolute right-10 bottom-10 flex flex-col items-end gap-10">
            <Button {...register('skip-button', playNext)} className="px-20">
              Skip
            </Button>
            <SmoothLink to={navigateUrl}>
              <Button {...register('sing-button', () => navigate(navigateUrl), undefined, true)} className="px-20">
                Sing this song
              </Button>
            </SmoothLink>
          </div>
        </SongPage>
      </NoPrerender>
    </LayoutGame>
  );
}

export default Jukebox;
