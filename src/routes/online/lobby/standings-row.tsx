import { ReactNode } from 'react';

import { formatScore } from '~/modules/online/format-score';
import { OnlineParticipant } from '~/modules/online/protocol/types';
import ParticipantBadges from '~/routes/online/components/participant-badges';
import {
  HostCrown,
  ParticipantActions,
  ParticipantName,
  ParticipantTags,
  Ping,
} from '~/routes/online/components/participant-parts';
import { useParticipantLive } from '~/routes/online/hooks/use-participant-live';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';
import { cn } from '~/utils/cn';

/** The table's columns, stated once so the heading and the rows cannot drift apart. */
const ROW_LAYOUT = 'flex w-full min-w-0 items-center gap-2 px-3';
const RANK_COLUMN = 'w-4';
const SCORE_COLUMN = 'w-24';
const ACTIONS_COLUMN = 'w-5';

/** The column headings, laid out like a row: same border, padding and columns, so they line up. */
export function StandingsHeader() {
  return (
    <div className={cn(ROW_LAYOUT, 'typography border border-transparent text-xs uppercase opacity-50')}>
      <span className={RANK_COLUMN}>#</span>
      <span className="flex-1">Singer</span>
      <span className={cn(SCORE_COLUMN, 'text-right')}>Score</span>
      <span className={ACTIONS_COLUMN} />
    </div>
  );
}

interface Props {
  participant: OnlineParticipant;
  /** This browser's participant id — its own row reads the mic locally and is picked out. */
  selfId: string;
  /** Who the room's host is: drives the crown beside their name and gates the kick button. */
  hostId: string | null;
  /** Position in the standings. */
  rank: number;
  /** null when this singer has nothing on the tab yet — drawn as a dash rather than as a zero. */
  score: number | null;
  /** Opens the name/color editor. Rendered on the own row only. */
  onEdit: () => void;
  /** Extras after the tags (a `picking` pill, …). */
  children?: ReactNode;
  'data-test'?: string;
}

/** One singer as a row of the standings table. Built on the mic-check row, so the player-colored
 * volume bar fills in behind it, but the table row takes the place of the centered name. */
function StandingsRow({ participant, selfId, hostId, rank, score, onEdit, children, 'data-test': dataTest }: Props) {
  const { stats, vote, isSelf, isIdle, volume } = useParticipantLive(participant, selfId);

  return (
    <MicCheckSlotShell
      data-test={dataTest}
      data-connected={participant.connected}
      data-idle={isIdle || undefined}
      data-vote={vote ?? 'none'}
      // One step up from the card, the way a picked-out row is drawn — no orange, that is for controls
      className={cn(isSelf && 'bg-black/55')}
      playerNumber={participant.playerNumber}
      connected={participant.connected}
      volume={volume}
      name={
        <span className={ROW_LAYOUT}>
          <span
            className={cn(RANK_COLUMN, 'text-inactive shrink-0 text-left text-sm tabular-nums')}
            data-test="participant-rank">
            {rank}
          </span>
          <HostCrown participant={participant} hostId={hostId} />
          <span className="flex min-w-0 flex-1 items-center justify-start gap-1.5">
            <ParticipantName participant={participant} isIdle={isIdle} />
            <ParticipantBadges inFlow vote={vote}>
              <ParticipantTags participant={participant} isSelf={isSelf} />
              {children}
            </ParticipantBadges>
          </span>
          {/* Score over ping, right-aligned, the way a `ScoreboardRow` stacks them */}
          <span className={cn(SCORE_COLUMN, 'flex shrink-0 flex-col items-end justify-center')}>
            <span
              className="text-active text-shadow-legible text-sm font-semibold tabular-nums"
              data-test="participant-score">
              {score === null ? '—' : formatScore(score)}
            </span>
            {stats && !isIdle && <Ping ms={stats.ping} className="text-inactive text-shadow-legible" />}
          </span>
          {/* Reserved on every row, so rows without a control keep the score column aligned */}
          <span className={cn(ACTIONS_COLUMN, 'flex shrink-0 items-center justify-center')}>
            <ParticipantActions
              participant={participant}
              onEdit={onEdit}
              showKick={hostId === selfId && !isSelf}
              isSelf={isSelf}
            />
          </span>
        </span>
      }
    />
  );
}

export default StandingsRow;
