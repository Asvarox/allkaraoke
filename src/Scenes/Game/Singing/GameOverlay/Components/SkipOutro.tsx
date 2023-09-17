import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import beatToMs from 'Scenes/Game/Singing/GameState/Helpers/beatToMs';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { getLastNoteEnd } from 'Songs/utils/notesSelectors';
import useDebounce from 'hooks/useDebounce';
import useKeyboard from 'hooks/useKeyboard';
import useKeyboardHelp from 'hooks/useKeyboardHelp';
import posthog from 'posthog-js';
import React, { useMemo, useState } from 'react';
import { useInterval } from 'react-use';

interface Props {
  onSongEnd: () => void;
  isEnabled: boolean;
}

const SHOW_OUTRO_THRESHOLD_MS = 15_000;

function SkipOutro({ onSongEnd, isEnabled }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const duration = GameState.getDuration();

  const singingEndBeat = useMemo(
    () => Math.max(...GameState.getPlayers().map((player) => getLastNoteEnd(player.getLastNotesSection()))),
    [],
  );

  const canSkip = useMemo(() => {
    const singingEndTime = beatToMs(singingEndBeat, GameState.getSong()!);

    return isEnabled && duration * 1000 > singingEndTime + SHOW_OUTRO_THRESHOLD_MS;
  }, [duration, singingEndBeat, isEnabled]);

  const [currentBeat, setCurrentBeat] = useState(0);
  const [skipping, setSkipping] = useState(false);

  useInterval(() => setCurrentBeat(GameState.getCurrentBeat()), 1_000);

  const shouldBeVisible = useDebounce(canSkip && currentBeat > singingEndBeat, 5_000) && !skipping;

  const skipOutro = () => {
    setSkipping(true);
    setTimeout(onSongEnd, 700);

    const { artist, title } = GameState.getSong()!;
    posthog.capture('outroSkipped', { name: `${artist} - ${title}`, artist, title });
  };
  useKeyboard({ accept: skipOutro }, shouldBeVisible);

  const help = useMemo(
    () => ({
      accept: 'Skip Outro',
      back: 'Pause Menu',
    }),
    [],
  );
  useKeyboardHelp(help, shouldBeVisible);

  return !mobilePhoneMode && canSkip ? (
    <Container visible={shouldBeVisible}>
      Press <Kbd>Enter</Kbd> to skip the outro
    </Container>
  ) : null;
}

const Container = styled.div<{ visible: boolean }>`
  ${typography};
  pointer-events: none;
  position: fixed;
  bottom: 29rem;
  transform: scale(${(props) => (props.visible ? 1 : 0)});
  opacity: ${(props) => (props.visible ? 1 : 0)};
  text-align: center;
  font-size: 5rem;
  text-shadow: 0 0 3.5rem black;
  width: 100%;
  z-index: 4;
  padding: 0.5rem;
  transition: ease 500ms;
`;

const Kbd = styled.kbd<{ disabled?: boolean }>`
  margin: 0.2rem;
  padding: 0.2rem 2rem;
  border-radius: 1.3rem;
  border: 0.5rem solid rgb(204, 204, 204);
  border-bottom-color: rgb(150, 150, 150);
  border-right-color: rgb(150, 150, 150);
  line-height: 1.4;
  display: inline-block;
  background-color: rgb(247, 247, 247);
  text-shadow: 0 1rem 0 #fff;

  opacity: ${(props) => (props.disabled ? 0.25 : 1)};
`;

export default React.memo(SkipOutro);
