import { motion } from 'motion/react';
import { ComponentRef, useLayoutEffect, useRef, useState } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { dialogSurface } from '~/modules/elements/akui/surfaces';
import { Input } from '~/modules/elements/input';
import styles from '~/modules/game-engine/drawing/styles';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import { ChatLine, isPending, useOnlineChat } from '~/modules/online/client/use-chat';
import { ONLINE_MAX_CHAT_LENGTH } from '~/modules/online/protocol/consts';
import { cn } from '~/utils/cn';

interface Props {
  register: RegisterFunc;
  /** Rendered inside the lobby card instead of beside it — see the note on layout below. */
  inline?: boolean;
}

/**
 * The lobby's chat.
 *
 * Placed by the lobby in one of two spots depending on the width: as `MenuWithLogo`'s `sidePanel`
 * from `lg` up, and `inline` inside the card below that, where there is no room for a second
 * column. One instance either way — see the note at the lobby's breakpoint check.
 *
 * Always pinned to the bottom, with no scrollback and no unread badge: the panel is on screen for
 * as long as anyone is in the lobby, so there is no "away" state for an unread count to describe.
 * The full history is kept in state regardless, so growing a scrollback later is a change to this
 * component alone.
 */
function ChatPanel({ register, inline }: Props) {
  const { lines, send } = useOnlineChat();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const input = useRef<ComponentRef<typeof Input>>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // Layout effect, not an effect: scrolling after the browser has painted the new line shows a
  // frame of the list one message short of the bottom.
  useLayoutEffect(() => {
    const element = scroller.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [lines]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    // Cleared straight away — the message is already on screen as a pending line, and leaving the
    // text behind would read as "not sent yet" twice over.
    setDraft('');
    setSending(true);
    const failure = await send(text);
    setSending(false);
    if (!failure) return;

    // Nothing was sent, so give the typing back rather than dropping it on the floor. The pending
    // line has already been removed by the hook.
    setDraft(text);
    input.current?.triggerValidationError(
      failure === 'rate-limited' ? 'Slow down — too many messages' : 'Not connected — press Enter to try again',
    );
  };

  // Nothing to send while the box is empty, or while the previous message is still in flight.
  const canSend = Boolean(draft.trim()) && !sending;

  const navProps = register('online-chat', () => input.current?.element?.focus(), 'Chat');

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        // Beside the card it is a surface of its own, and has to be built from the same parts the
        // lobby card is — `dialogSurface`, the menu's radius and its padding — or it reads as a
        // stray box parked next to the app. `h-full` fills the height the grid hands it.
        !inline && cn(dialogSurface, 'h-full rounded-none p-4 sm:p-6 md:rounded-xl'),
      )}
      // Not `online-chat`: `register` puts that name on the nav target below as its own
      // `data-test`, and two elements answering to one id makes every query for it ambiguous.
      data-test="online-chat-panel">
      {!inline && <Menu.Header>Chat</Menu.Header>}
      <div
        ref={scroller}
        // Takes the leftover height beside the card, so the input sits at the bottom of the panel
        // rather than halfway up it. `min-h-0` because a flex child defaults to its content's
        // height and would otherwise push past the panel instead of scrolling inside it. Inline,
        // there is no height to fill, so it falls back to a fixed one.
        className={cn(
          'text-md flex flex-col justify-end gap-1 overflow-y-hidden text-white',
          inline ? 'h-48' : 'min-h-0 flex-1',
        )}
        data-test="online-chat-messages">
        {lines.length === 0 ? (
          <Menu.HelpText className="text-center">Say hi while you wait.</Menu.HelpText>
        ) : (
          lines.map((line) => <ChatLineRow key={line.id} line={line} />)
        )}
      </div>
      <div {...navProps}>
        <Input
          ref={input}
          focused={navProps?.focused ?? false}
          size="small"
          label={null}
          value={draft}
          onChange={setDraft}
          maxLength={ONLINE_MAX_CHAT_LENGTH}
          placeholder="Say something…"
          onKeyDown={(e) => {
            // Enter sends and keeps the focus — the search bar blurs on Enter, but a chat box you
            // have to re-enter after every line is the wrong rhythm. Escape, and Backspace with
            // nothing left to delete, hand the keyboard back to the lobby's navigation.
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              void submit();
              return;
            }
            if (e.key === 'Escape' || (e.key === 'Backspace' && !draft)) {
              input.current?.element?.blur();
            }
          }}
          // Sits inside the box, the same way the song search puts its clear button there. Always
          // drawn, dimmed until there is something to send — a control that appears only once it
          // becomes usable never gets the chance to say what it is.
          //
          // `onMouseDown` with `preventDefault` rather than `onClick`: mousedown blurs the input
          // first, and a blur is what hands the keyboard back to the lobby — the click would land
          // on a control the navigation had already moved away from.
          adornment={
            <button
              type="button"
              aria-label="Send"
              className="flex disabled:cursor-default"
              disabled={!canSend}
              onMouseDown={(e) => {
                e.preventDefault();
                void submit();
              }}
              data-test="online-chat-send">
              <Icon
                icon="ic:baseline-send"
                size={5}
                // Muted, not invisible: on the field's near-black fill anything below roughly this
                // lightness reads as an empty box rather than a control waiting for input.
                className={cn('duration-300', canSend ? 'text-default' : 'text-gray-400')}
              />
            </button>
          }
          className="w-full"
          data-test="online-chat-input"
        />
      </div>
    </div>
  );
}

/**
 * One line: the author's name in their player color, then what they said. A line still in flight
 * is dimmed — the room has not accepted it yet, and it can still come back.
 *
 * A new line rises into the bottom of the list as it fades in, and `layout` is what makes the rest
 * of the conversation move up to meet it instead of jumping a row's height in a single frame. The
 * list is bottom-pinned, so every arrival displaces everything above it — animating only the new
 * line would leave the part of the panel the eye is actually resting on snapping.
 *
 * No exit animation: lines are never removed one at a time (the hundredth message drops the first,
 * off-screen), and confirming a pending line reuses its id, so the row is updated in place rather
 * than replaced — which is what keeps the entrance from running a second time on acknowledgement.
 */
function ChatLineRow({ line }: { line: ChatLine }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: isPending(line) ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="break-words"
      data-test="online-chat-message"
      data-pending={isPending(line) || undefined}>
      <span style={{ color: styles.colors.players[line.playerNumber].text }}>{line.authorName}</span>
      <span className="text-white/60">: </span>
      <span>{line.text}</span>
    </motion.div>
  );
}

export default ChatPanel;
