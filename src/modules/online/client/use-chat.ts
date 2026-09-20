import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { useOnlineConnectionStatus } from '~/modules/online/client/hooks';
import { trackOnlineChatMessageSent } from '~/modules/online/client/online-analytics';
import OnlineClient from '~/modules/online/client/online-client';
import { ONLINE_CHAT_HISTORY_SIZE, ONLINE_CHAT_RATE_LIMIT_ERROR } from '~/modules/online/protocol/consts';
import { ChatMessage } from '~/modules/online/protocol/types';
import { chatMessage as chatMessageSound } from '~/modules/sound-manager';

/** A message this browser has sent but the room has not confirmed yet — rendered faded, in place,
 * so typing feels immediate without pretending the room has seen it. */
export interface PendingChatMessage extends ChatMessage {
  pending: true;
}

export type ChatLine = ChatMessage | PendingChatMessage;

export const isPending = (line: ChatLine): line is PendingChatMessage => 'pending' in line;

/** Why a send failed, which decides what the panel says and whether resending is worth offering. */
export type ChatSendFailure = 'rate-limited' | 'disconnected';

/** Two messages landing within this don't play two sounds. A burst is one arrival as far as
 * anyone in the room can hear. */
const SOUND_THROTTLE_MS = 400;

/** Drops the oldest lines once there are more than the room itself keeps. The room evicts at
 * ONLINE_CHAT_HISTORY_SIZE, but a client accumulates everything published while it is open, so
 * without this a long-running lobby grows without bound — and would show scrollback the room can
 * no longer hand to anyone who joins later. */
const capHistory = (lines: ChatLine[]): ChatLine[] =>
  lines.length > ONLINE_CHAT_HISTORY_SIZE ? lines.slice(lines.length - ONLINE_CHAT_HISTORY_SIZE) : lines;

/** Appends `incoming` unless the id is already there, and replaces a pending line of the same id
 * with the room's confirmed copy. Ordering is append-only: ids are random, so position in the
 * array is the only ordering there is, and the room's is the one that counts. */
const mergeMessage = (lines: ChatLine[], incoming: ChatMessage): ChatLine[] => {
  const existing = lines.findIndex((line) => line.id === incoming.id);
  if (existing === -1) return capHistory([...lines, incoming]);
  // Confirming our own pending line: take the room's copy (its `at`, and its normalized text),
  // and leave it where it already sits rather than moving it to the end.
  const next = [...lines];
  next[existing] = incoming;
  return next;
};

/**
 * Asks the room for the backlog and folds it in ahead of whatever this client already has.
 *
 * History first, then anything that arrived while the request was in flight (and anything still
 * pending), in the order this client saw them — reconciled by id, so the duplicate the
 * subscribe-then-fetch ordering deliberately produces collapses instead of showing twice.
 */
const fetchHistory = (disposed: () => boolean, setLines: Dispatch<SetStateAction<ChatLine[]>>) =>
  OnlineClient.rpc.chat
    .getHistory()
    .then((history) => {
      if (disposed()) return;
      setLines((current) => {
        const known = new Set(history.map((message) => message.id));
        return capHistory([...history, ...current.filter((line) => !known.has(line.id))]);
      });
    })
    .catch(() => {
      // A room mid-handover has nobody to answer yet. The live channel keeps working, and the
      // reconnect effect below asks again once the client is attached to whoever took over.
    });

/**
 * The lobby's chat.
 *
 * Joining is subscribe-then-fetch, in that order on purpose: subscribing first means a message
 * published while the history request is in flight is still delivered, so the seam produces a
 * duplicate (which merges away by id) instead of a hole. The reverse order can silently lose a
 * message.
 *
 * The channel only ever carries the newest message — the backlog comes from `chat.getHistory`
 * once — so what the room broadcasts per message stays one message wide no matter how long the
 * conversation gets.
 */
export const useOnlineChat = () => {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const lastSoundAt = useRef(0);

  useEffect(() => {
    let disposed = false;

    const unsubscribe = OnlineClient.subscriptions.subscribe('chat', (message) => {
      if (disposed) return;
      setLines((current) => mergeMessage(current, message));
      // Only other people's messages make a sound — your own echo arriving a moment after you
      // pressed Enter is not news, and chirping at every keypress is what gets a lobby muted.
      if (message.authorId === OnlineClient.getParticipantId()) return;
      const now = Date.now();
      if (now - lastSoundAt.current < SOUND_THROTTLE_MS) return;
      lastSoundAt.current = now;
      void chatMessageSound.play();
    });

    void fetchHistory(() => disposed, setLines);

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, []);

  // Anything published while this client was not attached never reached the channel, so the
  // backlog has to be asked for again on every reconnect — and a P2P host handover is a reconnect
  // to a *different* room runtime, which is exactly when the gap is most likely. Reconciling by id
  // means a refetch that turns up nothing new costs a render and no visible change.
  const [status] = useOnlineConnectionStatus();
  const wasConnected = useRef(status === 'connected');
  useEffect(() => {
    const connected = status === 'connected';
    const reconnected = connected && !wasConnected.current;
    wasConnected.current = connected;
    if (!reconnected) return;

    let disposed = false;
    void fetchHistory(() => disposed, setLines);
    return () => {
      disposed = true;
    };
  }, [status]);

  /**
   * Sends a message, showing it faded straight away.
   *
   * The id is minted here rather than by the room: the room broadcasts the accepted message before
   * it answers this call (the handler publishes, then the response goes out), so the copy of our
   * own message generally arrives *first*. Carrying the id we already put on the pending line is
   * what lets the two be recognised as the same message whichever order they land in.
   *
   * Resolves to null on success, or why it failed — the caller puts the text back in the box.
   */
  const send = useCallback(async (text: string): Promise<ChatSendFailure | null> => {
    const body = text.trim();
    if (!body) return null;

    const id = uuid();
    // The pending line is drawn like any other, so it needs the same name and colour the room
    // will stamp on it — read from the room state this client already has rather than left blank
    // and filled in on confirmation, which would make the line visibly change as it lands.
    const participantId = OnlineClient.getParticipantId();
    const self = OnlineClient.subscriptions
      .getSnapshot('room-state')
      ?.participants.find((participant) => participant.id === participantId);
    const pending: PendingChatMessage = {
      id,
      at: Date.now(),
      authorId: participantId,
      authorName: self?.name ?? '',
      playerNumber: self?.playerNumber ?? 0,
      text: body,
      pending: true,
    };
    setLines((current) => [...current, pending]);

    try {
      const accepted = await OnlineClient.rpc.chat.send(body, id);
      const roomCode = OnlineClient.getRoomCode();
      if (roomCode) trackOnlineChatMessageSent(roomCode, accepted.text.length);
      // Usually a no-op: the broadcast has already replaced the pending line. It matters when the
      // response wins the race, or when the room re-minted the id because ours collided — then
      // this is what clears the pending copy.
      setLines((current) =>
        mergeMessage(
          current.filter((line) => !(isPending(line) && line.id === id)),
          accepted,
        ),
      );
      return null;
    } catch (error) {
      setLines((current) => current.filter((line) => !(isPending(line) && line.id === id)));
      const message = error instanceof Error ? error.message : String(error);
      return message === ONLINE_CHAT_RATE_LIMIT_ERROR ? 'rate-limited' : 'disconnected';
    }
  }, []);

  return { lines, send };
};
