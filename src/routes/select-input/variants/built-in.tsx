import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { ValuesType } from 'utility-types';

import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import Loader from '~/modules/elements/loader';
import { MenuButton } from '~/modules/elements/menu';
import { Switcher } from '~/modules/elements/switcher';
import { PlayerMicCheck } from '~/modules/elements/volume-indicator';
import events from '~/modules/game-events/game-events';
import { useEventEffect } from '~/modules/game-events/hooks';
import { usePlayerMicData } from '~/modules/hooks/players/use-player-mic';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import UserMediaEnabled from '~/modules/user-media/user-media-enabled';
import useMicSwitcher from '~/routes/select-input/hooks/use-mic-switcher';
import usePlayerNumberPreset from '~/routes/select-input/hooks/use-player-number-preset';
import { MicSetupPreference } from '~/routes/settings/settings-state';

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
  closeButtonText: string;
  /** Online-mode wizard variant: no input-type switching, no smartphone-as-mic suggestion. */
  onlineSetup?: boolean;
}

/**
 * The hints that come and go while the mic is being measured. Both live in one slot that always
 * reserves room for the taller of the two (see `TipSlot`), so a mic turning out to be (in)audible —
 * or the switch to another device restarting the measurement — never shoves the buttons around.
 */
const NOT_AUDIBLE_TIP = "Make some noise to the microphone. If that doesn't work, try using another microphone.";

/**
 * Shown while the browser is still asking for permission, and — being the longest of the
 * starting-up messages — also what `StartingUpReserve` holds the height of.
 */
const ALLOW_ACCESS_MESSAGE = 'Please allow access to the microphone so the default one can be selected.';

/**
 * Holds the height of the "still starting up" beats so they all measure the same: the permission
 * status resolving (which renders nothing at all), the permission being asked for, and the default
 * device being picked. It's the longest of those messages, rendered invisibly — text rather than the
 * warning icon, because an icon only gets its size once it has loaded and would pop the row open.
 *
 * The blocked-access screen isn't covered: it adds a how-to-unblock image, which makes it a
 * different screen rather than another beat of starting up.
 */
function StartingUpReserve() {
  return (
    <span className="typography invisible col-start-1 row-start-1 text-lg" aria-hidden>
      {ALLOW_ACCESS_MESSAGE}
    </span>
  );
}

function TipSlot({ reserveFor, children }: { reserveFor: ReactNode; children: ReactNode }) {
  return (
    <div className="grid">
      {/* The tallest hint this screen can show, rendered invisibly to hold the row open */}
      <Menu.HelpText className="invisible col-start-1 row-start-1" aria-hidden>
        {reserveFor}
      </Menu.HelpText>
      <Menu.HelpText className="col-start-1 row-start-1">{children}</Menu.HelpText>
    </div>
  );
}

function useIsPlayerMicAudible(inputLabel: string) {
  const [isAudible, setIsAudible] = useState<boolean | null>(null);

  const previousMeasurements = useRef<number[]>([]);
  const attempts = useRef(0);
  const onMeasure = useCallback(([volume]: [number, number]) => {
    previousMeasurements.current.push(volume);
    if (previousMeasurements.current.length > 35) {
      const medianMeasurement =
        previousMeasurements.current.sort()[Math.floor(previousMeasurements.current.length / 2)];

      const audible = medianMeasurement > 0;

      if (audible || attempts.current > 7) {
        setIsAudible(audible);
      } else {
        attempts.current++;
      }

      previousMeasurements.current.length = 0;
    }
  }, []);

  usePlayerMicData(0, onMeasure, isAudible !== true);

  useEffect(() => {
    previousMeasurements.current.length = 0;
    attempts.current = 0;
    setIsAudible(null);
  }, [inputLabel]);

  return isAudible;
}

function BuiltIn({ onSetupComplete, ...props }: Props) {
  usePlayerNumberPreset(1, 1);
  const { register } = useKeyboardNav({ onBackspace: props.onBack });

  const { Microphone, selectedMic, setMic, cycleMic } = useMicSwitcher();

  const autoselect = () => {
    if (selectedMic === '') {
      const defaultDevice = Microphone.getDefault();
      if (defaultDevice) {
        setMic(defaultDevice);
      }
    }
  };

  useEffect(autoselect, [autoselect]);
  useEventEffect([events.inputListChanged, events.playerRemoved], autoselect);

  const isAudible = useIsPlayerMicAudible(selectedMic);

  useEffect(() => {
    onSetupComplete(!!selectedMic && !!isAudible);
  }, [selectedMic, isAudible, onSetupComplete]);

  // The smartphone suggestion is the taller of the two hints, so it's what reserves the slot —
  // except online, where it's never offered and reserving for it would leave a hole.
  const smartphoneTip = (
    <>
      Built-in microphones can pick up music from the game. For more accurate scores, try using your{' '}
      <button onClick={() => props.changePreference('remoteMics')}>smartphone as a microphone</button>.
    </>
  );

  return (
    <>
      {/* Everything before a device is picked — the permission status still resolving (nothing to
          show yet), the permission being asked for, the default device being chosen — is one
          "starting up" moment, so all of it is stacked on a reserver holding that moment's height.
          The screen then resizes exactly once: when the actual setup takes over. */}
      <div className="grid">
        <StartingUpReserve />
        <div className="col-start-1 row-start-1 flex min-w-0 flex-col justify-center gap-4">
          <UserMediaEnabled fallback={<span className="typography text-lg">{ALLOW_ACCESS_MESSAGE}</span>}>
            {!selectedMic && <span className="typography text-lg">The default device is being selected.</span>}
            {selectedMic && (
              <>
                <div className="flex items-end justify-between">
                  <span className="typography text-lg">You&#39;ll sing using</span>
                  <Menu.HelpText>(click to change)</Menu.HelpText>
                </div>
                <Switcher {...register('selected-mic', cycleMic)} label="Mic" value={selectedMic}>
                  <PlayerMicCheck playerNumber={0} className="rounded-xl opacity-40" />
                </Switcher>
                <div className="flex items-center justify-end text-lg">
                  {isAudible === true && (
                    <>
                      <span className="typography">Microphone is audible</span>
                      <div className="flex h-8 w-10 items-center justify-end">
                        <Icon icon="ic:baseline-check" size={8} className="text-white" />
                      </div>
                    </>
                  )}
                  {isAudible === false && (
                    <>
                      <span className="typography">Microphone is not audible</span>
                      <div className="flex h-8 w-10 items-center justify-end">
                        <Icon icon="ic:baseline-error" size={8} className="text-red-500" />
                      </div>
                    </>
                  )}
                  {isAudible === null && (
                    <>
                      <span className="typography">Make some noise to the microphone</span>
                      <div className="flex h-8 w-10 items-center justify-end">
                        <Loader />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            {selectedMic && (
              <TipSlot reserveFor={props.onlineSetup ? NOT_AUDIBLE_TIP : smartphoneTip}>
                {isAudible === false
                  ? NOT_AUDIBLE_TIP
                  : isAudible === true && !props.onlineSetup
                    ? smartphoneTip
                    : null}
              </TipSlot>
            )}
          </UserMediaEnabled>
        </div>
      </div>
      {!props.onlineSetup && <MenuButton {...register('back-button', props.onBack)}>Change Input Type</MenuButton>}
      <MenuButton
        {...register('save-button', props.onSave, undefined, true, { disabled: !selectedMic })}
        disabled={!selectedMic}>
        {props.closeButtonText}
      </MenuButton>
    </>
  );
}

export default BuiltIn;
