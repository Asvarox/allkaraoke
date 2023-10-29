import CameraManager from 'Camera/CameraManager';
import SingASong from 'Scenes/SingASong/SingASong';
import useFullscreen from 'hooks/useFullscreen';
import { SingSetup, SongPreview } from 'interfaces';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import startViewTransition from 'utils/startViewTransition';
import Singing from './Singing/Singing';

interface Props {
  songId?: string;
}

function Game(props: Props) {
  const [singSetup, setSingSetup] = useState<(SingSetup & { song: SongPreview }) | null>(null);
  const [preselectedSong, setPreselectedSong] = useState<string | null>(props.songId ?? null);
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
  };

  useFullscreen();

  return (
    <>
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
    </>
  );
}
export default Game;
