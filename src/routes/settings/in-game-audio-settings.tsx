import { Switcher } from '~/modules/elements/switcher';
import { useRegister } from '~/modules/hooks/use-keyboard-nav';
import useMicSwitcher from '~/routes/select-input/hooks/use-mic-switcher';

/**
 * Swap the microphone everyone sings into, cycling the device list in place, as a navigable menu row.
 *
 * Only the online pause menu uses this today — the local one hands the whole job to
 * `SelectInputModal`, which can also re-assign inputs per player, something online mode (one singer
 * per browser) has nothing to do with.
 *
 * It has to be its own component so that `register` runs during THAT component's render: a
 * `register()` call written inline in the parent's JSX runs while the parent renders — before any
 * child renders — which would put it at the FRONT of the navigation list instead of its visual
 * position, making arrow navigation jump around. Takes `register` from the nearest <KeyboardNavContext>.
 */
export function InGameMicSwitcher() {
  const register = useRegister();
  const { selectedMic, cycleMic } = useMicSwitcher();

  return <Switcher {...register('selected-mic', cycleMic)} label="Mic" value={selectedMic || '—'} />;
}
