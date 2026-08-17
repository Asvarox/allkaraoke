import { useEffect, useRef, useState } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import Modal from '~/modules/elements/modal';
import { NavButton } from '~/modules/elements/nav-controls';
import GameState from '~/modules/game-engine/game-state/game-state';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import SongsService from '~/modules/songs/songs-service';
import RateSong from '~/routes/game/singing/game-overlay/components/rate-song';
import SelectInputModal from '~/routes/select-input/select-input-modal';
import { InGameInputLag } from '~/routes/settings/in-game-audio-settings';
import { InputLagSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  onResume: () => void;
  onExit?: () => void;
  onRestart: () => void;
  open: boolean;
}

const PauseMenuContent = ({ onResume, onExit, onRestart }: Omit<Props, 'open'>) => {
  const navigate = useSmoothNavigate();
  const menuRef = useRef<null | HTMLButtonElement>(null);

  useEffect(() => {
    menuRef.current?.focus();
  }, [menuRef]);

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputLag] = useSettingValue(InputLagSetting);

  const [rateSongOpen, setRateSongOpen] = useState(false);

  const { register } = useKeyboardNav({
    enabled: !isInputModalOpen,
    // Shared hook: the pause list and the rate-song view render into it one at a time, so the header
    // tracks whichever is showing.
    title: rateSongOpen ? 'Rate the song' : 'Pause menu',
    titleIcon: rateSongOpen ? undefined : 'pause',
  });

  const [isUnverifiedSongFlow, setIsUnverifiedSongFlow] = useState(false);
  const handleExit = async () => {
    const progress = GameState.getSongCompletionProgress();
    const currentSong = GameState.getSong();
    const songPreview = (await SongsService.getIndex()).find((song) => song.id === currentSong?.id);
    const shouldForceSharedRating = !!currentSong?.isUnverifiedSong && !songPreview;

    if (shouldForceSharedRating) {
      setIsUnverifiedSongFlow(true);
      setRateSongOpen(true);
      return;
    }

    if (!songPreview?.local && progress < 0.7) {
      setIsUnverifiedSongFlow(false);
      setRateSongOpen(true);
    } else {
      onExit?.();
    }
  };

  return (
    <>
      {!rateSongOpen && (
        <KeyboardNavContext value={register}>
          <Menu modal>
            {/* Resume starts playback again, so it reads as "play" rather than a generic back arrow. */}
            <NavButton name="button-resume-song" remoteIcon="play" onClick={onResume} ref={menuRef}>
              Resume song
            </NavButton>
            <NavButton name="button-restart-song" remoteIcon={null} onClick={onRestart}>
              Restart song
            </NavButton>
            <NavButton name="button-exit-song" remoteIcon={null} onClick={handleExit}>
              Exit song
            </NavButton>
            <NavButton name="input-settings" remoteIcon="settings" onClick={() => setIsInputModalOpen(true)}>
              Microphones settings
            </NavButton>
            <hr />
            {}
            <InGameInputLag value={inputLag} />
            {/* Hidden from the phone: it opens the full song editor, which is a desktop/TV-only
                surface the remote can't drive. */}
            <NavButton
              name="edit-song"
              hideOnRemote
              size="small"
              onClick={() => navigate(`edit/song/`, { song: GameState.getSong()?.id ?? '' })}>
              Edit song
            </NavButton>
          </Menu>
          <SelectInputModal
            onClose={() => setIsInputModalOpen(false)}
            closeButtonText={'Back to Pause Menu'}
            open={isInputModalOpen}
          />
        </KeyboardNavContext>
      )}
      {rateSongOpen && (
        <RateSong
          onExit={onExit}
          onBack={() => setRateSongOpen(false)}
          register={register}
          song={GameState.getSong()}
          isUnverifiedSong={isUnverifiedSongFlow}
        />
      )}
    </>
  );
};

export default function PauseMenu({ onResume, onExit, onRestart, open }: Props) {
  return (
    <Modal onClose={onResume} open={open}>
      {open && <PauseMenuContent onResume={onResume} onExit={onExit} onRestart={onRestart} />}
    </Modal>
  );
}
