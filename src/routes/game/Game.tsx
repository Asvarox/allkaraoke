import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Helmet } from 'react-helmet';
import { SingSetup, SongPreview } from '~/interfaces';
import CameraManager from '~/modules/camera/camera-manager';
import NoPrerender from '~/modules/elements/no-prerender';
import useFullscreen from '~/modules/hooks/use-fullscreen';
import useQueryParam from '~/modules/hooks/use-query-param';
import { woosh } from '~/modules/sound-manager';
import startViewTransition from '~/modules/utils/start-view-transition';
import SingASong from '~/routes/sing-a-song/sing-a-song';
import Singing from './singing/singing';

function Game() {
  const songId = useQueryParam('song');

  const [singSetup, setSingSetup] = useState<(SingSetup & { song: SongPreview }) | null>(null);
  const [preselectedSong, setPreselectedSong] = useState<string | null>(songId ?? null);
  const [resetKey, setResetKey] = useState(0);
  const handleSelect = (setup: SingSetup & { song: SongPreview }) => {
    const previewVideo = document.getElementById('preview-video-container');

    if (previewVideo) {
      previewVideo.style.viewTransitionName = 'song-preview-video';
      startViewTransition(() => {
        previewVideo.style.viewTransitionName = '';
        flushSync(() => {
          setSingSetup(setup);
        });
      });
    } else {
      setSingSetup(setup);
    }

    woosh.play(false);
  };

  useFullscreen();

  return (
    <>
      <Helmet>
        <title>Game | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <NoPrerender>
        {singSetup ? (
          <Singing
            restartSong={() => {
              CameraManager.restartRecord();
              setResetKey((current) => current + 1);
            }}
            key={resetKey}
            songPreview={singSetup.song}
            singSetup={singSetup}
            returnToSongSelection={() => {
              setPreselectedSong(singSetup.song.id);
              setSingSetup(null);
            }}
          />
        ) : (
          <SingASong onSongSelected={handleSelect} preselectedSong={preselectedSong} />
        )}
      </NoPrerender>
    </>
  );
}
export default Game;
