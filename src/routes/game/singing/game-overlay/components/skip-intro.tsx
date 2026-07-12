import posthog from 'posthog-js';
import { MutableRefObject, useMemo } from 'react';
import { Kbd } from '~/modules/elements/akui/kbd';
import { Menu } from '~/modules/elements/akui/menu';
import { VideoPlayerRef } from '~/modules/elements/video-player/index';
import GameState from '~/modules/game-engine/game-state/game-state';
import useKeyboard from '~/modules/hooks/use-keyboard';
import useKeyboardHelp from '~/modules/hooks/use-keyboard-help';
import getSkipIntroTime, { SKIP_INTRO_MS } from '~/modules/songs/utils/get-skip-intro-time';
import getSongFirstNoteMs from '~/modules/songs/utils/get-song-first-note-ms';
import songHasLongIntro from '~/modules/utils/song-has-long-intro';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  playerRef: MutableRefObject<VideoPlayerRef | null>;
  isEnabled: boolean;
}

function SkipIntro({ playerRef, isEnabled }: Props) {
  'use no memo'; // React Compiler: shouldBeVisible depends on GameState.getCurrentTime(), read directly during render, while playerRef/isEnabled props stay stable, so the compiler's auto-memo bails out and the skip-intro prompt freezes at its first computed visibility.
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
