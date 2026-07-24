import { ComponentRef, Ref, useEffect, useRef, useState } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import Modal from '~/modules/elements/modal';
import { NavButton } from '~/modules/elements/nav-controls';
import GameState from '~/modules/game-engine/game-state/game-state';
import useKeyboardNav, { KeyboardNavContext, useRegister } from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import SongsService from '~/modules/songs/songs-service';
import RateSong from '~/routes/game/singing/game-overlay/components/rate-song';
import SelectInputModal from '~/routes/select-input/select-input-modal';
import InputLag from '~/routes/settings/input-lag';
import { InputLagSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  onResume: () => void;
  onExit?: () => void;
  onRestart: () => void;
  open: boolean;
}

/**
 * The input-lag field as a navigable menu entry.
 *
 * It has to be its own component so that `register` runs during THIS component's render: a
 * `register()` call written inline in the parent's JSX runs while the parent renders — before any
 * child renders — which would put it at the FRONT of the navigation list (and of the mirrored control
 * list) instead of its visual position, making arrow navigation jump around. Every sibling here is a
 * `Nav.*` wrapper that registers from its own render, so this one must too.
 */
function PauseMenuInputLag({
  inputLagRef,
  value,
  onActive,
}: {
  inputLagRef: Ref<ComponentRef<typeof InputLag>>;
  value: number;
  onActive: () => void;
}) {
  const register = useRegister();
  return (
    <InputLag
      ref={inputLagRef}
      {...register('input-lag', onActive, 'Input lag', false, {
        control: { type: 'input-lag', label: 'Input lag', value },
      })}
    />
  );
}

const PauseMenuContent = ({ onResume, onExit, onRestart }: Omit<Props, 'open'>) => {
  const navigate = useSmoothNavigate();
  const menuRef = useRef<null | HTMLButtonElement>(null);
  const inputLagRef = useRef<ComponentRef<typeof InputLag>>(null);

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

  const onInputLagActive = () => inputLagRef.current?.element?.focus();

  return (
    <>
      {!rateSongOpen && (
        <KeyboardNavContext value={register}>
          <Menu>
            {/* Resume closes the pause menu — the phone's equivalent of Back, hence the back variant. */}
            <NavButton name="button-resume-song" variant="back" onClick={onResume} ref={menuRef}>
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
            <PauseMenuInputLag inputLagRef={inputLagRef} value={inputLag} onActive={onInputLagActive} />
            <NavButton
              name="edit-song"
              remoteIcon={null}
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
