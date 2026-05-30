import posthog from 'posthog-js';
import React, { useMemo, useState } from 'react';
import { useInterval } from 'react-use';
import { Kbd } from '~/modules/elements/akui/kbd';
import { Menu } from '~/modules/elements/akui/menu';
import GameState from '~/modules/game-engine/game-state/game-state';
import beatToMs from '~/modules/game-engine/game-state/helpers/beat-to-ms';
import useDebounce from '~/modules/hooks/use-debounce';
import useKeyboard from '~/modules/hooks/use-keyboard';
import useKeyboardHelp from '~/modules/hooks/use-keyboard-help';
import { getLastNoteEnd } from '~/modules/songs/utils/notes-selectors';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  onSongEnd?: () => void;
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
    <Menu.HelpText
      className={`pointer-events-none fixed bottom-[15rem] z-[4] w-full p-2 text-center text-2xl transition-all duration-500 [text-shadow:0_0_2rem_black] ${shouldBeVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} `}
      style={{ textShadow: '0 0 2rem black' }}
      data-test="skip-outro-info"
      data-visible={shouldBeVisible}>
      Press <Kbd>Enter</Kbd> to skip the outro
    </Menu.HelpText>
  ) : null;
}

export default React.memo(SkipOutro);
