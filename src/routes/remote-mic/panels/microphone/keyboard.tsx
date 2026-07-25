import {
  ArrowBack,
  ArrowForward,
  Games,
  Keyboard,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  Shuffle,
} from '@mui/icons-material';
import { captureException } from '@sentry/react';
import { ComponentProps, PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { twc, TwcComponentProps } from 'react-twc';
import { twMerge } from 'tailwind-merge';

import { Button } from '~/modules/elements/akui/button';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { useSubscription } from '~/modules/remote-mic/network/client/hooks/use-subscription';
import { keyStrokes } from '~/modules/remote-mic/network/messages';
import { HelpEntry, KeyboardLayoutMode } from '~/routes/keyboard-help/context';
import { assertNever } from '~/routes/keyboard-help/controls';
import { remoteButtonIcons } from '~/routes/keyboard-help/remote-button-icons';
import RemoteControl from '~/routes/remote-mic/panels/microphone/remote-controls';
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
//
// A fixed header (keyboard glyph + the mirrored screen's `title`) sits above a scrollable control
// column. The column fills the space the panel gives it (see the `flex`/`min-h-0` chain up through
// microphone.tsx) and is the single scroll region, so long menus stay reachable above the bottom tab
// bar without the whole panel scrolling; top/bottom shadows fade in to signal more content off-edge.
export function MirrorKeyboard({ keyboard }: { keyboard: HelpEntry }) {
  const controls = keyboard.controls ?? [];
  // A screen can name its own header glyph (e.g. pause for the pause menu, play for skip intro);
  // anything that doesn't falls back to the generic keyboard icon.
  const TitleIcon = keyboard.icon ? remoteButtonIcons[keyboard.icon] : Keyboard;
  return (
    <div data-test="remote-keyboard" data-mode="mirror" className="flex h-full min-h-0 w-full flex-col gap-3">
      {keyboard.title && (
        <div
          data-test="remote-keyboard-header"
          className="text-active flex shrink-0 items-center justify-center gap-2 text-lg font-bold landscape:hidden">
          <TitleIcon className="text-xl!" />
          <span className="min-w-0 truncate">{keyboard.title}</span>
        </div>
      )}
      <ScrollShadowColumn className="flex-1">
        {controls.map((control) => (
          <RemoteControl key={control.name} control={control} onActivate={onActivateControl} />
        ))}
      </ScrollShadowColumn>
    </div>
  );
}

// Tracks whether a vertical scroll container is scrolled away from its top / bottom edge, so callers
// can reveal directional affordances. Mirrors AKUI Selector's `useScrollArrows`, but on the Y axis.
// Observes the content wrapper (not just the viewport) so adding/removing controls re-evaluates too.
function useVerticalScrollShadows(
  scrollRef: React.RefObject<HTMLElement | null>,
  contentRef: React.RefObject<HTMLElement | null>,
) {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowTop(el.scrollTop > 1);
    setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [scrollRef, contentRef, update]);

  return { showTop, showBottom };
}

// A vertical scroll container with a soft shadow at whichever edge has more content out of view.
// Sizes itself via flex (`className` controls its share of the parent) rather than a fixed height,
// so it's the ONLY scroll region — the surrounding phone panel stays put, no nested/double scrolling.
function ScrollShadowColumn({ children, className }: PropsWithChildren<{ className?: string }>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { showTop, showBottom } = useVerticalScrollShadows(scrollRef, contentRef);

  return (
    <div className={twMerge('relative flex min-h-0 flex-col', className)}>
      {/* The mirror keyboard is only single-column in portrait, so the shadows bleed past the panel's
          `px-4` (`-left-4 -right-4`) to span the full screen width; in landscape (two columns) they're
          hidden entirely (`landscape:hidden`). */}
      <div
        className="pointer-events-none absolute top-0 -right-4 -left-4 z-10 h-8 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-150 landscape:hidden"
        style={{ opacity: showTop ? 1 : 0 }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-4 bottom-0 -left-4 z-10 h-8 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-150 landscape:hidden"
        style={{ opacity: showBottom ? 1 : 0 }}
        aria-hidden="true"
      />
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div ref={contentRef} className="flex flex-col gap-3">
          {children}
        </div>
      </div>
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
      className={twMerge('m-0.5 aspect-square scale-100 animate-none px-0!', className)}
      {...props}
    />
  );
}

function ActionButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button size="small" className={twMerge('m-0.5 w-full', className)} {...props} />;
}
