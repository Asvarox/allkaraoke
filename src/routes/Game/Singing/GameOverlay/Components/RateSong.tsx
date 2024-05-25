import styled from '@emotion/styled';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { MenuButton, MenuContainer } from 'modules/Elements/Menu';
import GameState from 'modules/GameEngine/GameState/GameState';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import posthog from 'posthog-js';
import { useEffect, useRef, useState } from 'react';

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
    const song = GameState.getSong();
    const properties = {
      songId: song?.id,
      songLastUpdated: song?.lastUpdate,
    };
    if (lyricsNotInSync) {
      posthog.capture('rate-song', { type: 'not-in-sync', ...properties });
    }
    if (volumeWrong) {
      posthog.capture('rate-song', { type: 'wrong-volume', ...properties });
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
          <span>Too loud/quiet</span>
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
