import { useState } from 'react';

import { SingSetup, SongPreview } from '~/interfaces';
import ConfirmModal from '~/modules/elements/akui/confirm-modal';
import SongPreviewLayout from '~/modules/elements/song-preview-layout';
import events from '~/modules/game-events/game-events';
import { useOnlineSongSelection } from '~/modules/online/song-selection-context';
import GameSettings from '~/routes/sing-a-song/song-selection/components/song-settings/game-settings';
import MicCheck from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check';

interface Props {
  songPreview: SongPreview;
  onPlay: (setup: SingSetup & { song: SongPreview }) => void;
  keyboardControl: boolean;
  onExitKeyboardControl: () => void;
}

export default function SongSettings({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
  const online = useOnlineSongSelection();
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
  };

  const isConfirmModalOpen = pendingSetup !== null;

  return (
    <>
      {/* Controlled: the confirmation isn't a button away, it's what "play" turns into when the song
          happens to be unverified. */}
      <ConfirmModal
        open={isConfirmModalOpen}
        onOpenChange={(open) => !open && setPendingSetup(null)}
        title="Unverified Shared Song"
        description="This shared song is unverified and might not work correctly. Continue anyway?"
        onConfirm={confirmPlayUnverifiedSong}
        dataTestPrefix="unverified-shared-song-confirm"
        cancelButton={
          <ConfirmModal.CancelButton name="cancel-play-unverified-song" isDefault={false}>
            Cancel
          </ConfirmModal.CancelButton>
        }
        confirmButton={
          <ConfirmModal.ConfirmButton name="confirm-play-unverified-song" isDefault>
            Continue
          </ConfirmModal.ConfirmButton>
        }
      />
      <SongPreviewLayout.Split
        className="[view-transition-name:song-preview-content]"
        aside={online ? online.playersView : <MicCheck />}>
        <GameSettings
          songPreview={songPreview}
          onNextStep={handlePlay}
          keyboardControl={keyboardControl}
          onExitKeyboardControl={onExitKeyboardControl}
        />
      </SongPreviewLayout.Split>
    </>
  );
}
