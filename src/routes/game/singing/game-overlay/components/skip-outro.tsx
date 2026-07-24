import posthog from 'posthog-js';
import React, { useMemo, useState } from 'react';
import { useInterval } from 'react-use';

import { Kbd } from '~/modules/elements/akui/kbd';
import { Menu } from '~/modules/elements/akui/menu';
import { NavRemoteControl } from '~/modules/elements/nav-controls';
import GameState from '~/modules/game-engine/game-state/game-state';
import beatToMs from '~/modules/game-engine/game-state/helpers/beat-to-ms';
import useDebounce from '~/modules/hooks/use-debounce';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import { getLastNoteEnd } from '~/modules/songs/utils/notes-selectors';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  onSongEnd?: () => void;
  isEnabled: boolean;
  /** Opens the pause menu — surfaced as the mirrored keyboard's Back control (the TV still uses Backspace). */
  onOpenPauseMenu?: () => void;
}

const SHOW_OUTRO_THRESHOLD_MS = 15_000;

function SkipOutro({ onSongEnd, isEnabled, onOpenPauseMenu }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const duration = GameState.getDuration();

  const singingEndBeat = useMemo(
    () => Math.max(...GameState.getPlayers().map((player) => getLastNoteEnd(player.getLastNotesSection()))),
    [],
  );

  const canSkip = useMemo(() => {
    const singingEndTime = beatToMs(singingEndBeat, GameState.getSong()!) + (GameState.getSong()?.gap ?? 0);

    return isEnabled && duration * 1000 > singingEndTime + SHOW_OUTRO_THRESHOLD_MS;
  }, [duration, singingEndBeat, isEnabled]);

  const [currentBeat, setCurrentBeat] = useState(0);
  const [skipping, setSkipping] = useState(false);

  useInterval(() => setCurrentBeat(GameState.getCurrentBeat()), 1_000);

  const shouldBeVisible = useDebounce(canSkip && currentBeat > singingEndBeat, 5_000) && !skipping;

  const skipOutro = () => {
    setSkipping(true);
    if (onSongEnd) {
      setTimeout(onSongEnd, 700);
    }

    const { artist, title } = GameState.getSong()!;
    posthog.capture('outroSkipped', { name: `${artist} - ${title}`, artist, title });
  };

  // A one-action mirror: the prompt element carries the skip action (so physical Enter still skips),
  // plus a remote-only Back that opens the pause menu — the phone otherwise has no Back in mirror mode.
  const { register } = useKeyboardNav({ enabled: shouldBeVisible, title: 'Skip outro', titleIcon: 'play' });
  // `focused` is stripped: the prompt is a plain HelpText, not a menu item, so it would leak onto the DOM.
  const { focused: _focused, ...skipNav } = register('skip-outro', skipOutro, 'Skip outro', true, {
    control: { type: 'button', label: 'Skip outro' },
  });

  return !mobilePhoneMode && canSkip ? (
    <KeyboardNavContext value={register}>
      <Menu.HelpText
        {...skipNav}
        className={`pointer-events-none fixed bottom-[15rem] z-[4] w-full p-2 text-center text-2xl transition-all duration-500 [text-shadow:0_0_2rem_black] ${shouldBeVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} `}
        style={{ textShadow: '0 0 2rem black' }}
        data-test="skip-outro-info"
        data-visible={shouldBeVisible}>
        Press <Kbd>Enter</Kbd> to skip the outro
      </Menu.HelpText>
      {onOpenPauseMenu && (
        <NavRemoteControl
          name="skip-outro-pause"
          control={{ type: 'button', label: 'Pause menu', variant: 'back' }}
          onClick={onOpenPauseMenu}
        />
      )}
    </KeyboardNavContext>
  ) : null;
}

export default React.memo(SkipOutro);
