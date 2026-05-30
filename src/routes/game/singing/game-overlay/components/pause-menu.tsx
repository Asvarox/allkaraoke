import { ComponentRef, useEffect, useRef, useState } from 'react';
import { Menu } from '~/modules/elements/akui/menu';
import { MenuButton } from '~/modules/elements/menu';
import Modal from '~/modules/elements/modal';
import GameState from '~/modules/game-engine/game-state/game-state';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import SongsService from '~/modules/songs/songs-service';
import RateSong from '~/routes/game/singing/game-overlay/components/rate-song';
import SelectInputModal from '~/routes/select-input/select-input-modal';
import InputLag from '~/routes/settings/input-lag';

interface Props {
  onResume: () => void;
  onExit?: () => void;
  onRestart: () => void;
  open: boolean;
}

const PauseMenuContent = ({ onResume, onExit, onRestart }: Omit<Props, 'open'>) => {
  const navigate = useSmoothNavigate();
  const menuRef = useRef<null | HTMLButtonElement>(null);
  const inputLagRef = useRef<ComponentRef<typeof InputLag>>(null);

  useEffect(() => {
    menuRef.current?.focus();
  }, [menuRef]);

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  const { register } = useKeyboardNav({ enabled: !isInputModalOpen });

  const [rateSongOpen, setRateSongOpen] = useState(false);
  const [isUnverifiedSharedSongFlow, setIsUnverifiedSharedSongFlow] = useState(false);
  const handleExit = async () => {
    const progress = GameState.getSongCompletionProgress();
    const currentSong = GameState.getSong();
    const songPreview = (await SongsService.getIndex()).find((song) => song.id === currentSong?.id);
    const shouldForceSharedRating = !!currentSong?.isUnverifiedSharedSong && !songPreview;

    if (shouldForceSharedRating) {
      setIsUnverifiedSharedSongFlow(true);
      setRateSongOpen(true);
      return;
    }

    if (!songPreview?.local && progress < 0.7) {
      setIsUnverifiedSharedSongFlow(false);
      setRateSongOpen(true);
    } else {
      onExit?.();
    }
  };

  const onInputLagActive = () => inputLagRef.current?.element?.focus();

  return (
    <>
      {!rateSongOpen && (
        <>
          <Menu>
            <MenuButton {...register('button-resume-song', onResume)} ref={menuRef}>
              Resume song
            </MenuButton>
            <MenuButton {...register('button-restart-song', onRestart)}>Restart song</MenuButton>
            <MenuButton {...register('button-exit-song', handleExit)}>Exit song</MenuButton>
            <MenuButton {...register('input-settings', () => setIsInputModalOpen(true))}>
              Microphones settings
            </MenuButton>
            <hr />
            {}
            <InputLag ref={inputLagRef} {...register('input-lag', onInputLagActive)} />
            <MenuButton
              {...register('edit-song', () => navigate(`edit/song/`, { song: GameState.getSong()?.id ?? '' }))}
              size="small">
              Edit song
            </MenuButton>
          </Menu>
          <SelectInputModal
            onClose={() => setIsInputModalOpen(false)}
            closeButtonText={'Back to Pause Menu'}
            open={isInputModalOpen}
          />
        </>
      )}
      {rateSongOpen && (
        <RateSong
          onExit={onExit}
          register={register}
          song={GameState.getSong()}
          isUnverifiedSharedSong={isUnverifiedSharedSongFlow}
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
