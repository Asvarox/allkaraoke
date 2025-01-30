import { Menu } from 'modules/Elements/AKUI/Menu';
import { MenuButton } from 'modules/Elements/Menu';
import Modal from 'modules/Elements/Modal';
import GameState from 'modules/GameEngine/GameState/GameState';
import SongsService from 'modules/Songs/SongsService';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import { useEffect, useRef, useState } from 'react';
import RateSong from 'routes/Game/Singing/GameOverlay/Components/RateSong';
import SelectInputModal from 'routes/SelectInput/SelectInputModal';
import InputLag from 'routes/Settings/InputLag';

interface Props {
  onResume: () => void;
  onExit?: () => void;
  onRestart: () => void;
  open: boolean;
}

const PauseMenuContent = ({ onResume, onExit, onRestart }: Omit<Props, 'open'>) => {
  const navigate = useSmoothNavigate();
  const menuRef = useRef<null | HTMLButtonElement>(null);
  const inputLagRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    menuRef.current?.focus();
  }, [menuRef]);

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  const { register } = useKeyboardNav({ enabled: !isInputModalOpen });

  const [rateSongOpen, setRateSongOpen] = useState(false);
  const handleExit = async () => {
    const progress = GameState.getSongCompletionProgress();
    const songPreview = (await SongsService.getIndex()).find((song) => song.id === GameState.getSong()?.id);

    if (!songPreview?.local && progress < 0.7) {
      setRateSongOpen(true);
    } else {
      onExit?.();
    }
  };

  const onInputLagActive = () => inputLagRef.current?.focus();

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
            {/* eslint-disable-next-line react-compiler/react-compiler */}
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
      {rateSongOpen && <RateSong onExit={onExit} register={register} song={GameState.getSong()} />}
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
