import { ReactNode, useState } from 'react';

import { Chip } from '~/modules/elements/akui/chip';
import { Menu } from '~/modules/elements/akui/menu';
import { dialogSurface } from '~/modules/elements/akui/surfaces';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import { formatScore } from '~/modules/online/format-score';
import { OnlineRoomState } from '~/modules/online/protocol/types';
import { ONLINE_MAX_PLAYERS, PLAYER_NUMBERS } from '~/modules/players/player-number';
import ParticipantSlot from '~/routes/online/components/participant-slot';
import RoomCodePanel from '~/routes/online/lobby/room-code-panel';
import { rankParticipants, SCORE_TABS, ScoreTab } from '~/routes/online/lobby/room-standings';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';
import { cn } from '~/utils/cn';

interface Props {
  roomCode: string;
  roomState: OnlineRoomState;
  selfId: string;
  register: RegisterFunc;
  /** Opens the name/color editor for the own row. */
  onEdit: () => void;
  /** Rendered inside the lobby card instead of as a column of its own. */
  inline?: boolean;
  /** Leaves the room — shown next to the room code when this panel carries it. */
  back?: ReactNode;
}

/** The room's scoreboard: who is here, how they are doing, and what their mic is picking up. One
 * instance, placed by the lobby either as a column of its own (`xl` up) or `inline` in the card. */
function RoomLeaderboard({ roomCode, roomState, selfId, register, onEdit, inline, back }: Props) {
  const [tab, setTab] = useState<ScoreTab>('session');

  // An older host sends no standings at all — every row then shows a dash
  const rows = rankParticipants(roomState.participants, roomState.roomScores ?? {}, tab);
  const takenSeats = roomState.participants.length;
  // Free seats wear the colour whoever takes them will get, so a half-empty room reads as one
  const freePlayerNumbers = PLAYER_NUMBERS.filter(
    (number) => !roomState.participants.some((participant) => participant.playerNumber === number),
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        // Beside the card it is a surface of its own, built from the same parts as the card
        !inline && cn(dialogSurface, 'h-full min-h-0 rounded-none p-4 sm:p-6 md:rounded-xl'),
      )}
      data-test="online-room-leaderboard">
      {/* The invite travels with the singer list; inline, the card shows it instead */}
      {!inline && <RoomCodePanel roomCode={roomCode} back={back} />}

      <div className="flex items-center justify-between gap-2">
        <span className="typography text-md whitespace-nowrap" data-test="online-room-seats">
          Room · {takenSeats} / {ONLINE_MAX_PLAYERS}
        </span>
        <Menu.ButtonGroup className="gap-1" data-test="online-score-tab" data-tab={tab}>
          {SCORE_TABS.map(({ id, label }) => (
            <Menu.Button
              key={id}
              {...register(`online-score-tab-${id}`, () => setTab(id), label)}
              size="mini"
              aria-pressed={tab === id}
              className={cn('shrink-0 px-3 text-xs', tab !== id && 'opacity-60')}>
              {label}
            </Menu.Button>
          ))}
        </Menu.ButtonGroup>
      </div>

      {/* Mirrors a `columns` row — border, padding and the empty action slot — so headings line up */}
      <div className="typography flex items-center gap-2 border border-transparent px-3 text-xs uppercase opacity-50">
        <span className="w-4">#</span>
        <span className="flex-1">Singer</span>
        <span className="w-24 text-right">Score</span>
        <span className="w-5" />
      </div>

      {/* `min-h-0` so a full room scrolls inside the panel rather than growing it */}
      <div className={cn('flex flex-col gap-2', !inline && 'min-h-0 flex-1 overflow-y-auto')}>
        {rows.map(({ participant, score }, index) => (
          <ParticipantSlot
            key={participant.id}
            data-test={`online-participant-${participant.playerNumber}`}
            participant={participant}
            selfId={selfId}
            hostId={roomState.hostId}
            layout="columns"
            rank={index + 1}
            highlight={participant.id === selfId}
            showVote
            showTags
            onEdit={onEdit}
            canKick
            trailing={
              <span className="text-active text-sm font-semibold tabular-nums" data-test="participant-score">
                {score === null ? '—' : formatScore(score)}
              </span>
            }>
            {/* Only while nothing is picked — otherwise it would just repeat the host's crown */}
            {participant.id === roomState.hostId && !roomState.chart && (
              <Chip variant="orange" className="relative" data-test="participant-picking">
                picking
              </Chip>
            )}
          </ParticipantSlot>
        ))}

        {freePlayerNumbers.map((playerNumber) => (
          <MicCheckSlotShell
            key={`empty-${playerNumber}`}
            data-test={`online-empty-slot-${playerNumber}`}
            playerNumber={playerNumber}
            name={<span className="text-md">Free slot</span>}
            connected={false}
            volume={{ type: 'none' }}
          />
        ))}
      </div>

      {rows.length === 0 && <Menu.HelpText className="text-center">Waiting for singers…</Menu.HelpText>}
    </div>
  );
}

export default RoomLeaderboard;
