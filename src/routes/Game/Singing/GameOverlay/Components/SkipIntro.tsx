import styled from '@emotion/styled';
import { VideoPlayerRef } from 'modules/Elements/VideoPlayer';
import { typography } from 'modules/Elements/cssMixins';
import GameState from 'modules/GameEngine/GameState/GameState';
import getSkipIntroTime, { SKIP_INTRO_MS } from 'modules/Songs/utils/getSkipIntroTime';
import getSongFirstNoteMs from 'modules/Songs/utils/getSongFirstNoteMs';
import useKeyboard from 'modules/hooks/useKeyboard';
import useKeyboardHelp from 'modules/hooks/useKeyboardHelp';
import songHasLongIntro from 'modules/utils/songHasLongIntro';
import posthog from 'posthog-js';
import { MutableRefObject, useMemo } from 'react';
import { MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';

interface Props {
  playerRef: MutableRefObject<VideoPlayerRef | null>;
  isEnabled: boolean;
}

function SkipIntro({ playerRef, isEnabled }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const song = GameState.getSong()!;
  const hasLongIntro = useMemo(() => songHasLongIntro(song), [song]);
  const songFirstNoteMs = useMemo(() => getSongFirstNoteMs(song), [song]);
  const shouldBeVisible = GameState.getCurrentTime(false) < songFirstNoteMs - SKIP_INTRO_MS * 1.2;

  const canSkip = isEnabled && shouldBeVisible && hasLongIntro;

  const skipIntro = () => {
    playerRef.current?.seekTo(getSkipIntroTime(song));

    const { artist, title } = GameState.getSong()!;
    posthog.capture('introSkipped', { name: `${artist} - ${title}`, artist, title });
  };
  useKeyboard({ accept: skipIntro }, canSkip);

  const help = useMemo(
    () => ({
      accept: 'Skip Intro',
      back: 'Pause Menu',
    }),
    [],
  );
  useKeyboardHelp(help, canSkip);

  return !mobilePhoneMode && canSkip ? (
    <Container visible={canSkip} data-test="skip-intro-info">
      Press <Kbd>Enter</Kbd> to skip the intro
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

export default SkipIntro;
