import { OnlineParticipant, RoomStandings } from '~/modules/online/protocol/types';

/** Which figure of a `RoomStanding` the table is ranked by. */
export type ScoreTab = 'session' | 'last-song';

/** The two tabs over the table, in the order they are offered. */
export const SCORE_TABS: { id: ScoreTab; label: string }[] = [
  { id: 'session', label: 'Session' },
  { id: 'last-song', label: 'Last song' },
];

export interface RankedParticipant {
  participant: OnlineParticipant;
  /** null when this singer has nothing on this tab yet — drawn as a dash rather than as a zero. */
  score: number | null;
}

/** The room's singers in standings order — driven by `participants`, so a singer who left is gone.
 * Anyone without a score on this tab sorts last; ties and the unscored tail keep join order. */
export const rankParticipants = (
  participants: OnlineParticipant[],
  standings: RoomStandings,
  tab: ScoreTab,
): RankedParticipant[] =>
  participants
    .map((participant) => {
      const scores = standings[participant.id];
      return {
        participant,
        score: (tab === 'session' ? scores?.total : scores?.lastSong) ?? null,
      };
    })
    .sort((a, b) => {
      if (a.score === b.score) return a.participant.joinOrder - b.participant.joinOrder;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
