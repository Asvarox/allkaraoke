import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { ValuesType } from 'utility-types';

import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { Skeleton } from '~/modules/elements/akui/skeleton';
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
 * The audibility line while the mic is still being measured — the state the screen enters as soon as
 * a device is picked, so it's also what the loading placeholder is sized against.
 */
const MEASURING_MESSAGE = 'Make some noise to the microphone';

/** Shown while the browser is still asking for permission. */
const ALLOW_ACCESS_MESSAGE = 'Please allow access to the microphone so the default one can be selected.';

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

  // Laid out in full from the first frame, with the mic and its audibility as placeholders until the
  // default device is picked. Handed to `UserMediaEnabled` as both its pending and its granted
  // content: nothing here needs the permission to have resolved, so the screen opens as itself
  // rather than as an empty panel, and the same tree stays mounted once access comes through.
  const setup = (
    <>
      <div className="flex items-end justify-between">
        <span className="typography text-lg">You&#39;ll sing using</span>
        <Menu.HelpText>(click to change)</Menu.HelpText>
      </div>
      {/* Unregistered while loading: there's no other device to cycle to yet, and the switcher is
          inert anyway. */}
      <Switcher
        {...(selectedMic ? register('selected-mic', cycleMic) : {})}
        loading={!selectedMic}
        label="Mic"
        value={selectedMic}>
        {selectedMic ? <PlayerMicCheck playerNumber={0} className="rounded-xl opacity-40" /> : null}
      </Switcher>
      <div className="flex items-center justify-end text-lg">
        {!selectedMic && (
          <>
            {/* The message this line becomes, rendered invisibly under the placeholder bar: it gives
                the bar both its width and — where the screen is narrow enough for the message to
                wrap — the height of however many lines it takes. */}
            <span className="typography grid">
              <span className="invisible col-start-1 row-start-1" aria-hidden>
                {MEASURING_MESSAGE}
              </span>
              <Skeleton className="col-start-1 row-start-1 h-5 w-full self-center" />
            </span>
            <div className="flex h-8 w-10 items-center justify-end">
              <Loader />
            </div>
          </>
        )}
        {selectedMic && isAudible === true && (
          <>
            <span className="typography">Microphone is audible</span>
            <div className="flex h-8 w-10 items-center justify-end">
              <Icon icon="ic:baseline-check" size={8} className="text-default" />
            </div>
          </>
        )}
        {selectedMic && isAudible === false && (
          <>
            <span className="typography">Microphone is not audible</span>
            <div className="flex h-8 w-10 items-center justify-end">
              <Icon icon="ic:baseline-error" size={8} className="text-danger" />
            </div>
          </>
        )}
        {selectedMic && isAudible === null && (
          <>
            <span className="typography">{MEASURING_MESSAGE}</span>
            <div className="flex h-8 w-10 items-center justify-end">
              <Loader />
            </div>
          </>
        )}
      </div>
      {/* Rendered while loading too: the slot is height-reserved, so leaving it out until a device
          is picked would be one more thing popping the layout open. */}
      <TipSlot reserveFor={props.onlineSetup ? NOT_AUDIBLE_TIP : smartphoneTip}>
        {selectedMic && isAudible === false
          ? NOT_AUDIBLE_TIP
          : selectedMic && isAudible === true && !props.onlineSetup
            ? smartphoneTip
            : null}
      </TipSlot>
    </>
  );

  return (
    <>
      <div className="flex min-w-0 flex-col justify-center gap-4">
        <UserMediaEnabled fallback={<span className="typography text-lg">{ALLOW_ACCESS_MESSAGE}</span>} pending={setup}>
          {setup}
        </UserMediaEnabled>
      </div>
      {!props.onlineSetup && <MenuButton {...register('back-button', props.onBack)}>Change Input Type</MenuButton>}
      <MenuButton
        {...register('save-button', props.onSave, undefined, true, {
          disabled: !selectedMic,
        })}
        disabled={!selectedMic}>
        {props.closeButtonText}
      </MenuButton>
    </>
  );
}

export default BuiltIn;
