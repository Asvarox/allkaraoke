import { ReactNode } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import CopyLinkField from '~/modules/elements/copy-link-field';
import RoomCode from '~/modules/elements/room-code';
import buildRoomLink from '~/modules/utils/build-room-link';
import { cn } from '~/utils/cn';

interface Props {
  roomCode: string;
  className?: string;
  /** The way out of the room, ahead of the heading. */
  back?: ReactNode;
}

/** The room code with the invite link and its copy button — the same shape the remote-mic
 * connection screen uses. The lobby builds it once and puts it wherever it has room at this width. */
function RoomCodePanel({ roomCode, className, back }: Props) {
  const link = buildRoomLink('online', roomCode);

  return (
    <div className={cn('flex flex-col gap-2', className)} data-test="online-invite-link">
      {/* The code drops to its own line where the column is too narrow for all three */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {back}
        <Menu.Header className="justify-start whitespace-nowrap">Room code:</Menu.Header>
        <RoomCode code={roomCode} className="typography text-xl max-lg:text-lg" data-test="online-room-code" />
      </div>
      <CopyLinkField link={link} inputDataTest="online-invite-link-input" buttonDataTest="copy-room-link-button" />
    </div>
  );
}

export default RoomCodePanel;
