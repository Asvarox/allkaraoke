import { useState } from 'react';

import { SingSetup, SongPreview } from '~/interfaces';
import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import events from '~/modules/game-events/game-events';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import GameSettings from '~/routes/sing-a-song/song-selection/components/song-settings/game-settings';
import MicCheck from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check';

// Shared by the on-screen buttons and the mirrored descriptors sent to remote mics, so the two can't
// drift. `ConfirmModal` is a generic akui component and renders its own buttons, so the `Nav.*`
// wrappers (which render the control themselves) don't apply here — the descriptors go through
// `register`'s `control` option instead.
const CANCEL_UNVERIFIED_LABEL = 'Cancel';
const CONFIRM_UNVERIFIED_LABEL = 'Continue';

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
    if (songPreview.isUnverifiedSong) {
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
        cancelLabel={CANCEL_UNVERIFIED_LABEL}
        confirmLabel={CONFIRM_UNVERIFIED_LABEL}
        dataTestPrefix="unverified-shared-song-confirm"
        cancelButtonProps={registerConfirm(
          'cancel-play-unverified-song',
          cancelPlayUnverifiedSong,
          CANCEL_UNVERIFIED_LABEL,
          false,
          { control: { type: 'button', label: CANCEL_UNVERIFIED_LABEL, variant: 'back' } },
        )}
        confirmButtonProps={registerConfirm(
          'confirm-play-unverified-song',
          confirmPlayUnverifiedSong,
          CONFIRM_UNVERIFIED_LABEL,
          true,
          // Forward arrow (the default) reads as "proceed", matching the other "move on" buttons.
          { control: { type: 'button', label: CONFIRM_UNVERIFIED_LABEL } },
        )}
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
