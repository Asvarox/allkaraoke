import { SingSetup, SongPreview } from '~/interfaces';
import events from '~/modules/GameEvents/GameEvents';
import GameSettings from '~/routes/SingASong/SongSelection/Components/SongSettings/GameSettings';
import MicCheck from '~/routes/SingASong/SongSelection/Components/SongSettings/MicCheck';

interface Props {
  songPreview: SongPreview;
  onPlay: (setup: SingSetup & { song: SongPreview }) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
}

export default function SongSettings({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
  const handlePlay = (setup: SingSetup) => {
    events.songStarted.dispatch(songPreview, setup);
    onPlay({ song: songPreview, ...setup });
  };

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:gap-24 [&_hr]:opacity-25">
      <MicCheck className="w-full shrink-0 sm:w-2/5" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
        <GameSettings
          songPreview={songPreview}
          onNextStep={handlePlay}
          keyboardControl={keyboardControl}
          onExitKeyboardControl={onExitKeyboardControl}
        />
      </div>
    </div>
  );
}
