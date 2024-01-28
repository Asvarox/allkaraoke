import CameraManager from 'Camera/CameraManager';
import NoPrerender from 'Elements/NoPrerender';
import SingASong from 'Scenes/SingASong/SingASong';
import { woosh } from 'SoundManager';
import useFullscreen from 'hooks/useFullscreen';
import useQueryParam from 'hooks/useQueryParam';
import { SingSetup, SongPreview } from 'interfaces';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import startViewTransition from 'utils/startViewTransition';
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

    woosh.play();
  };

  useFullscreen();

  return (
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
  );
}
export default Game;
