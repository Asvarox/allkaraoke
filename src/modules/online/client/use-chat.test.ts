import { describe, expect, it } from 'vitest';

import { ChatLine, mergeFetchedHistory, PendingChatMessage } from '~/modules/online/client/use-chat';
import { ONLINE_CHAT_HISTORY_SIZE } from '~/modules/online/protocol/consts';
import { ChatMessage } from '~/modules/online/protocol/types';

const message = (id: string, at: number, text = id): ChatMessage => ({
  id,
  at,
  authorId: 'p1',
  authorName: 'Singer',
  playerNumber: 0,
  text,
});

const pending = (id: string, at: number): PendingChatMessage => ({ ...message(id, at), pending: true });

describe('mergeFetchedHistory', () => {
  it('keeps a message that arrived while the request was in flight', () => {
    const history = [message('a', 1), message('b', 2)];
    const current: ChatLine[] = [message('b', 2), message('c', 3)];

    expect(mergeFetchedHistory(current, history).map((line) => line.id)).toEqual(['a', 'b', 'c']);
  });

  it('drops local lines the room has rolled past rather than blending two backlogs', () => {
    // A reconnect after a busy spell: nothing this client holds is still in the room's history.
    const stale: ChatLine[] = Array.from({ length: ONLINE_CHAT_HISTORY_SIZE }, (_, i) => message(`stale-${i}`, i + 1));
    const history = Array.from({ length: ONLINE_CHAT_HISTORY_SIZE }, (_, i) => message(`fresh-${i}`, 1_000 + i));

    const merged = mergeFetchedHistory(stale, history);

    // The authoritative backlog survives intact. Concatenating and trimming from the end would
    // have kept the stale lines and thrown away everything just fetched.
    expect(merged).toHaveLength(ONLINE_CHAT_HISTORY_SIZE);
    expect(merged.every((line) => line.id.startsWith('fresh-'))).toBe(true);
  });

  it('never trims a pending line, even when the history is already full', () => {
    const history = Array.from({ length: ONLINE_CHAT_HISTORY_SIZE }, (_, i) => message(`h-${i}`, i + 1));
    const current: ChatLine[] = [pending('mine', 9_999)];

    const merged = mergeFetchedHistory(current, history);

    expect(merged).toHaveLength(ONLINE_CHAT_HISTORY_SIZE + 1);
    expect(merged[merged.length - 1].id).toBe('mine');
  });

  it('caps the merged history at the size the room keeps', () => {
    const history = Array.from({ length: ONLINE_CHAT_HISTORY_SIZE }, (_, i) => message(`h-${i}`, i + 1));
    const current: ChatLine[] = [message('newer', 10_000)];

    const merged = mergeFetchedHistory(current, history);

    expect(merged).toHaveLength(ONLINE_CHAT_HISTORY_SIZE);
    expect(merged[merged.length - 1].id).toBe('newer');
  });
});
