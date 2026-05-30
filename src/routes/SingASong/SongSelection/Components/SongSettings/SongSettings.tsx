import { useState } from 'react';
import { SingSetup, SongPreview } from '~/interfaces';
import ConfirmModal from '~/modules/Elements/AKUI/ConfirmModal';
import events from '~/modules/GameEvents/GameEvents';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import GameSettings from '~/routes/SingASong/SongSelection/Components/SongSettings/GameSettings';
import MicCheck from '~/routes/SingASong/SongSelection/Components/SongSettings/MicCheck';

interface Props {
  songPreview: SongPreview;
  onPlay: (setup: SingSetup & { song: SongPreview }) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
}

export default function SongSettings({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
  const [pendingSetup, setPendingSetup] = useState<SingSetup | null>(null);

  const startSong = (setup: SingSetup) => {
    events.songStarted.dispatch(songPreview, setup);
    onPlay({ song: songPreview, ...setup });
  };

  const handlePlay = (setup: SingSetup) => {
    if (songPreview.isUnverifiedSharedSong) {
      setPendingSetup(setup);
      return;
    }

    startSong(setup);
  };

  const confirmPlayUnverifiedSong = () => {
    if (!pendingSetup) {
      return;
    }

    startSong(pendingSetup);
    setPendingSetup(null);
  };

  const cancelPlayUnverifiedSong = () => {
    setPendingSetup(null);
  };

  const isConfirmModalOpen = pendingSetup !== null;

  // Keyboard nav for the confirmation modal — enabled only while the modal is open
  // so it takes over control and the GameSettings nav is paused simultaneously.
  const { register: registerConfirm } = useKeyboardNav({
    enabled: isConfirmModalOpen,
    onBackspace: cancelPlayUnverifiedSong,
    direction: 'horizontal',
  });

  return (
    <>
      <ConfirmModal
        open={isConfirmModalOpen}
        onClose={cancelPlayUnverifiedSong}
        title="Unverified Shared Song"
        description="This shared song is unverified and might not work correctly. Continue anyway?"
        cancelLabel="Cancel"
        confirmLabel="Continue"
        dataTestPrefix="unverified-shared-song-confirm"
        cancelButtonProps={registerConfirm('cancel-play-unverified-song', cancelPlayUnverifiedSong)}
        confirmButtonProps={registerConfirm('confirm-play-unverified-song', confirmPlayUnverifiedSong, undefined, true)}
      />
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:gap-24 [&_hr]:opacity-25">
        <MicCheck className="w-full shrink-0 sm:w-2/5" />
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
          <GameSettings
            songPreview={songPreview}
            onNextStep={handlePlay}
            // Pause GameSettings keyboard nav while the confirmation modal is taking over control
            keyboardControl={keyboardControl && !isConfirmModalOpen}
            onExitKeyboardControl={onExitKeyboardControl}
          />
        </div>
      </div>
    </>
  );
}
