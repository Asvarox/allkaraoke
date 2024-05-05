import styled from '@emotion/styled';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import useKeyboardNav from 'hooks/useKeyboardNav';
import posthog from 'posthog-js';
import { useEffect, useRef, useState } from 'react';
import GameState from 'Scenes/Game/Singing/GameState/GameState';

interface Props {
  onExit: () => void;
  register: ReturnType<typeof useKeyboardNav>['register'];
}

export default function RateSong({ register, onExit }: Props) {
  const menuRef = useRef<null | HTMLButtonElement>(null);
  const [lyricsNotInSync, setLyricsNotInSync] = useState(false);
  const [volumeWrong, setVolumeWrong] = useState(false);

  useEffect(() => {
    menuRef.current?.focus();
  }, [menuRef]);

  const handleRate = () => {
    const songId = GameState.getSong()?.id;
    if (lyricsNotInSync) {
      posthog.capture('rate-song', { type: 'not-in-sync', songId });
    }
    if (volumeWrong) {
      posthog.capture('rate-song', { type: 'wrong-volume', songId });
    }
    onExit();
  };

  return (
    <>
      <MenuContainer>
        <h1>Is the song OK?</h1>
        <h4>If there's something wrong with the song, let me know so I can fix it</h4>
        <Checkbox {...register('button-not-in-sync', () => setLyricsNotInSync((current) => !current))} size={'small'}>
          <Check>{lyricsNotInSync ? <CheckBox /> : <CheckBoxOutlineBlank />}</Check>
          <span>Lyrics are not in sync</span>
        </Checkbox>
        <Checkbox {...register('button-wrong-volume', () => setVolumeWrong((current) => !current))} size={'small'}>
          <Check>{volumeWrong ? <CheckBox /> : <CheckBoxOutlineBlank />}</Check>
          Volume is too high/low
        </Checkbox>
        <hr />
        <MenuButton {...register('button-song-ok', handleRate, undefined, true)} ref={menuRef}>
          {volumeWrong || lyricsNotInSync ? 'Submit and exit' : 'All good, exit the song'}
        </MenuButton>
      </MenuContainer>
    </>
  );
}

// todo make it a generic component
const Checkbox = styled(MenuButton)`
  justify-content: flex-start;
  gap: 1rem;
`;

const Check = styled.div`
  svg {
    width: 3rem;
    height: 3rem;
  }
  display: flex;
  align-items: center;
  justify-content: center;
`;
