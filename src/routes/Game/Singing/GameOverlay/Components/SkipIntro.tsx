import posthog from 'posthog-js';
import { MutableRefObject, useMemo } from 'react';
import { Kbd } from '~/modules/Elements/AKUI/Kbd';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import { VideoPlayerRef } from '~/modules/Elements/VideoPlayer';
import GameState from '~/modules/GameEngine/GameState/GameState';
import getSkipIntroTime, { SKIP_INTRO_MS } from '~/modules/Songs/utils/getSkipIntroTime';
import getSongFirstNoteMs from '~/modules/Songs/utils/getSongFirstNoteMs';
import useKeyboard from '~/modules/hooks/useKeyboard';
import useKeyboardHelp from '~/modules/hooks/useKeyboardHelp';
import songHasLongIntro from '~/modules/utils/songHasLongIntro';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/Settings/SettingsState';

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
    <Menu.HelpText
      className="pointer-events-none fixed bottom-[15rem] z-[4] w-full p-2 text-center text-2xl transition-all duration-500 [text-shadow:0_0_2rem_black]"
      style={{
        transform: canSkip ? 'scale(1)' : 'scale(0)',
        opacity: canSkip ? 1 : 0,
      }}
      data-test="skip-intro-info">
      Press <Kbd>Enter</Kbd> to skip the intro
    </Menu.HelpText>
  ) : null;
}

export default SkipIntro;
