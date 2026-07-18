import {
  ArrowBack,
  ArrowForward,
  Games,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  Shuffle,
} from '@mui/icons-material';
import { captureException } from '@sentry/react';
import { ComponentProps } from 'react';
import { twc, TwcComponentProps } from 'react-twc';
import { twMerge } from 'tailwind-merge';

import { Button } from '~/modules/elements/akui/button';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { useSubscription } from '~/modules/remote-mic/network/client/hooks/use-subscription';
import { keyStrokes } from '~/modules/remote-mic/network/messages';
import { HelpEntry, KeyboardLayoutMode } from '~/routes/keyboard-help/context';
import { assertNever } from '~/routes/keyboard-help/controls';
import RemoteControl, { remoteSelectorBackground } from '~/routes/remote-mic/panels/microphone/remote-controls';
import RemoteSongSearch from '~/routes/remote-mic/panels/microphone/remote-song-search';

interface Props {
  onSearchStateChange?: (isActive: boolean) => void;
}

let exceptionCaptured = false;

function vibrate() {
  try {
    navigator?.vibrate?.(100);
  } catch (e) {
    if (!exceptionCaptured) {
      captureException(e, {
        level: 'warning',
      });
      exceptionCaptured = true;
    }
  }
}

const onPress = (key: keyStrokes) => () => {
  vibrate();
  void serverRpc.input.keystroke(key);
};

const onActivateControl = (name: string) => {
  vibrate();
  void serverRpc.input.activateControl(name);
};

/**
 * Renders the remote-mic keyboard panel for the active screen. Each layout `mode` has its own
 * renderer; the exhaustive `switch` (with `assertNever`) forces a renderer to exist for every mode.
 */
export default function RemoteMicKeyboard({ onSearchStateChange }: Props) {
  const keyboard = useSubscription('keyboard-layout');

  if (keyboard === undefined) return null;

  const mode: KeyboardLayoutMode = keyboard.mode ?? 'classic';

  switch (mode) {
    case 'mirror':
      return <MirrorKeyboard keyboard={keyboard} />;
    case 'song-selection':
      return <SongSelectionKeyboard keyboard={keyboard} onSearchStateChange={onSearchStateChange} />;
    case 'classic':
      return <ClassicKeyboard keyboard={keyboard} />;
    default:
      return assertNever(mode);
  }
}

// Mirror mode — the active screen described its own controls; render them directly instead of arrows.
// There's no injected "Back" button here: the mirrored screen must include its own back control
// (e.g. Options' "Return To Main Menu", marked `variant="back"`) as one of its regular controls,
// same as it would on-screen — no separate/duplicated back affordance to keep in sync.
function MirrorKeyboard({ keyboard }: { keyboard: HelpEntry }) {
  const controls = keyboard.controls ?? [];
  return (
    <div data-test="remote-keyboard" data-mode="mirror" className="flex w-full flex-col gap-3">
      {controls.map((control) => (
        <RemoteControl key={control.name} control={control} onActivate={onActivateControl} />
      ))}
    </div>
  );
}

// Classic mode — generic arrow + accept/back navigation shared by most menus.
function ClassicKeyboard({ keyboard }: { keyboard: HelpEntry }) {
  return (
    <div data-test="remote-keyboard" data-mode="classic" className="flex flex-wrap justify-center gap-4">
      <NavPad keyboard={keyboard} />
    </div>
  );
}

// Song-selection mode — the bespoke song browser: search widget + arrow pad + "Random song".
// Extend here (e.g. playlist controls) without touching the other modes.
function SongSelectionKeyboard({ keyboard, onSearchStateChange }: { keyboard: HelpEntry } & Props) {
  return (
    <div data-test="remote-keyboard" data-mode="song-selection" className="flex flex-wrap justify-center gap-4">
      {keyboard.remote?.includes('search') && <RemoteSongSearch onSearchStateChange={onSearchStateChange} />}
      <NavPad keyboard={keyboard} />
      {/* "Random song" only makes sense while browsing songs, so it lives in this mode, not NavPad. */}
      <ActionsContainer
        $disabled={keyboard.shiftR === undefined}
        data-test="keyboard-shift-r"
        className="w-full basis-full">
        <ActionButton onClick={onPress('random')}>
          <Shuffle /> {keyboard.shiftR || 'Random Song'}
        </ActionButton>
      </ActionsContainer>
    </div>
  );
}

// Shared arrow pad + accept/back, used by classic and song-selection modes.
function NavPad({ keyboard }: { keyboard: HelpEntry }) {
  const isHorizontal = keyboard.horizontal !== undefined || keyboard['horizontal-vertical'] !== undefined;
  const isVertical = keyboard.vertical !== undefined || keyboard['horizontal-vertical'] !== undefined;

  return (
    <>
      {(isHorizontal || isVertical) && (
        <ActionsContainer>
          <ArrowsContainer>
            <ArrowButton
              onClick={onPress('up')}
              disabled={!isVertical}
              data-disabled={!isVertical}
              data-test="arrow-up">
              <KeyboardArrowUp />
            </ArrowButton>
          </ArrowsContainer>
          <ArrowsContainer>
            <ArrowButton
              onClick={onPress('left')}
              disabled={!isHorizontal}
              data-disabled={!isHorizontal}
              data-test="arrow-left">
              <KeyboardArrowLeft />
            </ArrowButton>
            <ArrowButton disabled data-disabled>
              <Games />
            </ArrowButton>
            <ArrowButton
              onClick={onPress('right')}
              disabled={!isHorizontal}
              data-disabled={!isHorizontal}
              data-test="arrow-right">
              <KeyboardArrowRight />
            </ArrowButton>
          </ArrowsContainer>
          <ArrowsContainer>
            <ArrowButton
              onClick={onPress('down')}
              disabled={!isVertical}
              data-disabled={!isVertical}
              data-test="arrow-down">
              <KeyboardArrowDown />
            </ArrowButton>
          </ArrowsContainer>
        </ActionsContainer>
      )}
      <ActionsContainer className="gap-4">
        <ActionButton onClick={onPress('back')} disabled={keyboard.back === undefined} data-test="keyboard-backspace">
          {keyboard.back || (
            <>
              <ArrowBack /> Back
            </>
          )}
        </ActionButton>
        <ActionButton onClick={onPress('accept')} disabled={keyboard.accept === undefined} data-test="keyboard-enter">
          {keyboard.accept || (
            <>
              Enter <ArrowForward />
            </>
          )}
        </ActionButton>
      </ActionsContainer>
    </>
  );
}

const ArrowsContainer = twc.div`flex flex-1 justify-center text-xl text-white`;

const ActionsContainer = twc.div<TwcComponentProps<'div'> & { $disabled?: boolean }>((props) => [
  'flex flex-1 flex-col justify-between',
  props.$disabled ? 'opacity-0' : 'opacity-100',
]);

function ArrowButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      size="small"
      className={twMerge('m-0.5 aspect-square scale-100 animate-none px-0!', remoteSelectorBackground, className)}
      {...props}
    />
  );
}

function ActionButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button size="small" className={twMerge('m-0.5 w-full', remoteSelectorBackground, className)} {...props} />;
}
