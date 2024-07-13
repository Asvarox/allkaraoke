import { SingSetup, SongPreview } from 'interfaces';
import CameraManager from 'modules/Camera/CameraManager';
import NoPrerender from 'modules/Elements/NoPrerender';
import { woosh } from 'modules/SoundManager';
import useFullscreen from 'modules/hooks/useFullscreen';
import useQueryParam from 'modules/hooks/useQueryParam';
import startViewTransition from 'modules/utils/startViewTransition';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Helmet } from 'react-helmet';
import SingASong from 'routes/SingASong/SingASong';
import Singing from './Singing/Singing';

function Game() {
  const songId = useQueryParam('song');

  const [singSetup, setSingSetup] = useState<(SingSetup & { song: SongPreview }) | null>(null);
  const [preselectedSong, setPreselectedSong] = useState<string | null>(songId ?? null);
  const [resetKey, setResetKey] = useState(0);
  const handleSelect = (setup: SingSetup & { song: SongPreview }) => {
    // @ts-expect-error
    document.getElementById('preview-video-container')!.style.viewTransitionName = 'song-preview-video';
    startViewTransition(() => {
      // @ts-expect-error
      document.getElementById('preview-video-container')!.style.viewTransitionName = '';
      flushSync(() => {
        setSingSetup(setup);
      });
    });

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
