import { Close, Edit } from '@mui/icons-material';
import { ReactNode } from 'react';
import { useOnlinePlayersStats } from '~/modules/online/client/hooks';
import { OnlineRoomState } from '~/modules/online/protocol/types';
import ParticipantStatsRow from '~/routes/online/components/participant-stats-row';

interface Props {
  roomState: OnlineRoomState;
  selfId: string;
  /** Opens the name/color editor for the own row. */
  onEdit?: () => void;
  /** Host only: kick (and ban) another singer — confirmation handled by the caller. */
  onKick?: (participantId: string) => void;
}

const probeLabel: Record<string, string> = {
  pending: 'checking video…',
  playable: 'video ok',
  failed: 'video failed',
};

const Tag = ({ children, ...props }: { children: ReactNode; 'data-test'?: string }) => (
  <span className="bg-active text-default relative rounded-full px-2 text-xs" {...props}>
    {children}
  </span>
);

function ParticipantList({ roomState, selfId, onEdit, onKick }: Props) {
  const isHost = roomState.hostId === selfId;
  const stats = useOnlinePlayersStats();

  return (
    <div className="flex flex-col gap-1" data-test="online-participant-list">
      {roomState.participants.map((participant) => (
        <ParticipantStatsRow
          key={participant.id}
          participant={participant}
          stats={stats[participant.id]}
          data-test={`online-participant-${participant.playerNumber}`}>
          {participant.id === selfId && <span className="relative opacity-75">(you)</span>}
          {participant.id === selfId && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Change your name or color"
              className="hover:text-active relative flex items-center opacity-75 hover:opacity-100"
              data-test="customize-button">
              <Edit className="h-5 w-5" />
            </button>
          )}
          {participant.id === roomState.hostId && <Tag data-test="participant-host">host</Tag>}
          {!participant.connected && <Tag>disconnected</Tag>}
          {participant.ready && <Tag data-test="participant-ready">ready</Tag>}
          {probeLabel[participant.probe] && <Tag>{probeLabel[participant.probe]}</Tag>}
          {isHost && participant.id !== selfId && onKick && (
            <button
              type="button"
              onClick={() => onKick(participant.id)}
              title={`Remove ${participant.name} from the room`}
              className="relative flex items-center opacity-75 hover:text-red-400 hover:opacity-100"
              data-test={`online-kick-${participant.playerNumber}`}>
              <Close className="h-5 w-5" />
            </button>
          )}
        </ParticipantStatsRow>
      ))}
    </div>
  );
}

export default ParticipantList;
