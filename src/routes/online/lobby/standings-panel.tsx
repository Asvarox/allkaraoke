import { useState } from 'react';

import { Chip } from '~/modules/elements/akui/chip';
import { Selector } from '~/modules/elements/akui/selector';
import { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import { OnlineRoomState } from '~/modules/online/protocol/types';
import { ONLINE_MAX_PLAYERS, PLAYER_NUMBERS } from '~/modules/players/player-number';
import { rankParticipants, SCORE_TABS, ScoreTab } from '~/routes/online/lobby/room-standings';
import StandingsRow, { StandingsHeader } from '~/routes/online/lobby/standings-row';
import { MicCheckSlotShell } from '~/routes/sing-a-song/song-selection/components/song-settings/mic-check/mic-check-slot';
import { cn } from '~/utils/cn';

interface Props {
  roomState: OnlineRoomState;
  selfId: string;
  register: RegisterFunc;
  /** Opens the name/color editor for the own row. */
  onEdit: () => void;
  /** Rendered inside the lobby card instead of in a column of its own. */
  inline?: boolean;
}

/** The room's standings: who is here, how they are doing, and what their mic is picking up. One
 * instance, placed by the lobby either in a column of its own (`xl` up) or `inline` in the card. */
function StandingsPanel({ roomState, selfId, register, onEdit, inline = false }: Props) {
  const [tab, setTab] = useState<ScoreTab>('session');

  // An older host sends no standings at all — every row then shows a dash
  const rows = rankParticipants(roomState.participants, roomState.standings ?? {}, tab);
  const takenSeats = roomState.participants.length;
  // Free seats wear the colour whoever takes them will get, so a half-empty room reads as one
  const freePlayerNumbers = PLAYER_NUMBERS.filter(
    (number) => !roomState.participants.some((participant) => participant.playerNumber === number),
  );

  return (
    <div className={cn('flex flex-col gap-3', !inline && 'min-h-0 flex-1')} data-test="online-room-standings">
      <div className="flex items-center justify-between gap-2">
        <span className="typography text-md whitespace-nowrap" data-test="online-room-seats">
          Room · {takenSeats} / {ONLINE_MAX_PLAYERS}
        </span>
        <Selector value={tab} onChange={(id) => setTab(id as ScoreTab)}>
          {SCORE_TABS.map(({ id, label }) => (
            <Selector.Item
              key={id}
              value={id}
              size="mini"
              className="px-3 text-sm"
              aria-pressed={tab === id}
              {...register(`online-score-tab-${id}`, () => setTab(id), label)}>
              {label}
            </Selector.Item>
          ))}
        </Selector>
      </div>

      <StandingsHeader />

      {/* `min-h-0` so a full room scrolls inside the panel rather than growing it */}
      <div className={cn('flex flex-col gap-2', !inline && 'min-h-0 flex-1 overflow-y-auto')}>
        {rows.map(({ participant, score }, index) => (
          <StandingsRow
            key={participant.id}
            data-test={`online-participant-${participant.playerNumber}`}
            participant={participant}
            selfId={selfId}
            hostId={roomState.hostId}
            rank={index + 1}
            score={score}
            onEdit={onEdit}>
            {/* Only while nothing is picked — otherwise it would just repeat the host's crown */}
            {participant.id === roomState.hostId && !roomState.chart && (
              <Chip variant="orange" className="relative" data-test="participant-picking">
                picking
              </Chip>
            )}
          </StandingsRow>
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
    </div>
  );
}

export default StandingsPanel;
