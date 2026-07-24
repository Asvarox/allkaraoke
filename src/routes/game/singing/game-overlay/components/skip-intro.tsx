import posthog from 'posthog-js';
import { MutableRefObject, useMemo } from 'react';

import { Kbd } from '~/modules/elements/akui/kbd';
import { Menu } from '~/modules/elements/akui/menu';
import { NavRemoteControl } from '~/modules/elements/nav-controls';
import { VideoPlayerRef } from '~/modules/elements/video-player/index';
import GameState from '~/modules/game-engine/game-state/game-state';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import getSkipIntroTime, { SKIP_INTRO_MS } from '~/modules/songs/utils/get-skip-intro-time';
import getSongFirstNoteMs from '~/modules/songs/utils/get-song-first-note-ms';
import songHasLongIntro from '~/modules/utils/song-has-long-intro';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  playerRef: MutableRefObject<VideoPlayerRef | null>;
  isEnabled: boolean;
  /** Opens the pause menu — surfaced as the mirrored keyboard's Back control (the TV still uses Backspace). */
  onOpenPauseMenu?: () => void;
}

function SkipIntro({ playerRef, isEnabled, onOpenPauseMenu }: Props) {
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

  // A one-action mirror: the prompt element carries the skip action (so physical Enter still skips),
  // plus a remote-only Back that opens the pause menu — the phone otherwise has no Back in mirror mode.
  const { register } = useKeyboardNav({ enabled: canSkip, title: 'Skip intro' });
  // `focused` is stripped: the prompt is a plain HelpText, not a menu item, so it would leak onto the
  // DOM node — the mirror descriptor and physical-Enter handler are all we need from register here.
  const { focused: _focused, ...skipNav } = register('skip-intro', skipIntro, 'Skip intro', true, {
    control: { type: 'button', label: 'Skip intro' },
  });

  return !mobilePhoneMode && canSkip ? (
    <KeyboardNavContext value={register}>
      <Menu.HelpText
        {...skipNav}
        className="pointer-events-none fixed bottom-[15rem] z-[4] w-full p-2 text-center text-2xl transition-all duration-500 [text-shadow:0_0_2rem_black]"
        style={{
          transform: canSkip ? 'scale(1)' : 'scale(0)',
          opacity: canSkip ? 1 : 0,
        }}
        data-test="skip-intro-info">
        Press <Kbd>Enter</Kbd> to skip the intro
      </Menu.HelpText>
      {onOpenPauseMenu && (
        <NavRemoteControl
          name="skip-intro-pause"
          control={{ type: 'button', label: 'Pause menu', variant: 'back' }}
          onClick={onOpenPauseMenu}
        />
      )}
    </KeyboardNavContext>
  ) : null;
}

export default SkipIntro;
