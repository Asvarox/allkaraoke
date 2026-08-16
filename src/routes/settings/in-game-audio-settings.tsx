import { ComponentRef, useRef } from 'react';

import { Switcher } from '~/modules/elements/switcher';
import { useRegister } from '~/modules/hooks/use-keyboard-nav';
import useMicSwitcher from '~/routes/select-input/hooks/use-mic-switcher';
import InputLag from '~/routes/settings/input-lag';

/**
 * The audio settings a pause menu lets you change without leaving the song, as navigable menu rows.
 * Shared by the local pause menu and the online one so they stay the same controls.
 *
 * Each row has to be its own component so that `register` runs during THAT component's render: a
 * `register()` call written inline in the parent's JSX runs while the parent renders — before any
 * child renders — which would put it at the FRONT of the navigation list (and of the mirrored control
 * list) instead of its visual position, making arrow navigation jump around. Every sibling in a pause
 * menu registers from its own render, so these must too.
 *
 * Both take `register` from the nearest <KeyboardNavContext>.
 */

/**
 * Swap the microphone everyone sings into, cycling the device list in place.
 *
 * Only the online pause menu uses this today — the local one hands the whole job to
 * `SelectInputModal`, which can also re-assign inputs per player, something online mode (one singer
 * per browser) has nothing to do with. It lives here anyway so both mic controls and the input-lag
 * row are found in one place, and because it too has to register from its own render.
 */
export function InGameMicSwitcher() {
  const register = useRegister();
  const { selectedMic, cycleMic } = useMicSwitcher();

  return <Switcher {...register('selected-mic', cycleMic)} label="Mic" value={selectedMic || '—'} />;
}

interface InputLagProps {
  /**
   * The current input lag, for the descriptor mirrored to the remote mic. Read by the screen that
   * owns `useKeyboardNav` rather than here, so that a change re-renders the whole menu and every row
   * re-registers together — registering from a lone child re-render would move this row to the front
   * of the navigation list. Omit to keep the row off the mirrored keyboard entirely: mirroring is
   * all-or-nothing, so a single descriptor on a screen that has no others (the online pause menu)
   * would read as partial coverage and drop it back to arrow keys.
   */
  value?: number;
}

/** Nudge the audio/lyrics offset, for when the two have drifted apart on this setup. */
export function InGameInputLag({ value }: InputLagProps) {
  const register = useRegister();
  const inputLagRef = useRef<ComponentRef<typeof InputLag>>(null);

  return (
    <InputLag
      ref={inputLagRef}
      {...register('input-lag', () => inputLagRef.current?.element?.focus(), 'Input lag', false, {
        control: value === undefined ? undefined : { type: 'input-lag', label: 'Input lag', value },
      })}
    />
  );
}
