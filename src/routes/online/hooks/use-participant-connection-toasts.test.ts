import { describe, expect, it } from 'vitest';

import { OnlineParticipant } from '~/modules/online/protocol/types';
import { diffParticipantConnections } from '~/routes/online/hooks/use-participant-connection-toasts';

const participant = (id: string, connected = true): OnlineParticipant => ({
  id,
  name: id,
  joinOrder: 0,
  playerNumber: 0,
  connected,
  ready: false,
  graceDeadline: null,
});

const kinds = (previous: OnlineParticipant[], next: OnlineParticipant[], selfId: string | null = 'self') =>
  diffParticipantConnections(previous, next, selfId).map(({ kind, participant }) => [kind, participant.id]);

describe('diffParticipantConnections', () => {
  it('reports a new singer as joined', () => {
    expect(kinds([participant('a')], [participant('a'), participant('b')])).toEqual([['joined', 'b']]);
  });

  it('reports connection flips', () => {
    expect(kinds([participant('a')], [participant('a', false)])).toEqual([['disconnected', 'a']]);
    expect(kinds([participant('a', false)], [participant('a')])).toEqual([['reconnected', 'a']]);
  });

  it('reports a connected singer vanishing as left', () => {
    expect(kinds([participant('a'), participant('b')], [participant('a')])).toEqual([['left', 'b']]);
  });

  it('does not report a grace expiry twice', () => {
    expect(kinds([participant('a'), participant('b', false)], [participant('a')])).toEqual([]);
  });

  it('ignores the own participant', () => {
    expect(kinds([], [participant('self')])).toEqual([]);
    expect(kinds([participant('self')], [participant('self', false)])).toEqual([]);
    expect(kinds([participant('self')], [])).toEqual([]);
  });
});
