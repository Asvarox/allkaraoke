import { useEffect, useRef } from 'react';

import { OnlineParticipant, OnlineRoomState } from '~/modules/online/protocol/types';

export type ParticipantConnectionChange = {
  kind: 'joined' | 'reconnected' | 'disconnected' | 'left';
  participant: OnlineParticipant;
};

/**
 * What changed in who is connected between two room-state pushes. Every client receives the same
 * pushes, so each derives the same changes without the room sending dedicated events.
 * A singer whose grace window ran out is not reported again — they were already reported disconnected.
 */
export function diffParticipantConnections(
  previous: OnlineParticipant[],
  next: OnlineParticipant[],
  selfId: string | null,
): ParticipantConnectionChange[] {
  const previousById = new Map(previous.map((participant) => [participant.id, participant]));
  const nextIds = new Set(next.map((participant) => participant.id));
  const changes: ParticipantConnectionChange[] = [];

  next.forEach((participant) => {
    if (participant.id === selfId) return;
    const before = previousById.get(participant.id);
    if (!before) {
      if (participant.connected) changes.push({ kind: 'joined', participant });
    } else if (before.connected !== participant.connected) {
      changes.push({ kind: participant.connected ? 'reconnected' : 'disconnected', participant });
    }
  });
  previous.forEach((participant) => {
    if (participant.id === selfId || nextIds.has(participant.id) || !participant.connected) return;
    changes.push({ kind: 'left', participant });
  });

  return changes;
}

const MESSAGES: Record<ParticipantConnectionChange['kind'], string> = {
  joined: 'joined the room',
  reconnected: 'reconnected',
  disconnected: 'disconnected',
  left: 'left the room',
};

/** Toasts other singers joining, dropping out and coming back. The first push only sets the baseline,
 * so entering a room doesn't announce everyone already in it. */
export function useParticipantConnectionToasts(roomState: OnlineRoomState | undefined, selfId: string | null) {
  const previous = useRef<{ roomCode: string; participants: OnlineParticipant[] } | null>(null);

  useEffect(() => {
    if (!roomState) return;
    const before = previous.current;
    previous.current = { roomCode: roomState.roomCode, participants: roomState.participants };
    if (!before || before.roomCode !== roomState.roomCode) return;

    const changes = diffParticipantConnections(before.participants, roomState.participants, selfId);
    if (changes.length === 0) return;

    void import('react-toastify').then(({ toast }) => {
      changes.forEach(({ kind, participant }) => {
        const notify = kind === 'joined' || kind === 'reconnected' ? toast.success : toast.warning;
        const toastId = `online-participant-${participant.id}`;
        notify(
          <span>
            <b className="ph-no-capture">{participant.name}</b> {MESSAGES[kind]}
          </span>,
          { toastId, updateId: toastId },
        );
      });
    });
  }, [roomState, selfId]);
}
