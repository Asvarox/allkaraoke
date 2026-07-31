import { useState } from 'react';

import { Button } from '~/modules/elements/akui/button';
import useResponsiveValue from '~/modules/elements/akui/hooks/use-responsive-value';
import { Icon } from '~/modules/elements/akui/icon';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import FullscreenButton from '~/modules/toolbar/fullscreen';
import QRCodeModal from '~/modules/toolbar/qr-code-modal';
import RenameModal from '~/routes/remote-mic/components/rename-modal';
import useRemoteMicName from '~/routes/remote-mic/hooks/use-remote-mic-name';
import Ping from '~/routes/remote-mic/panels/microphone/ping';
import { ConnectionStatuses } from '~/routes/remote-mic/remote-mic';

// Maps each connection status to a Tailwind text-color class for the status dot
const dotColorByStatus: Record<ConnectionStatuses, string> = {
  uninitialised: 'text-gray-400',
  connecting: 'text-gray-400',
  reconnecting: 'text-blue-400',
  connected: 'text-green-400',
  disconnected: 'text-red-400',
  error: 'text-red-400',
};

interface Props {
  connectionStatus: ConnectionStatuses;
  roomId: string | null;
}

function TopBar({ connectionStatus, roomId }: Props) {
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const { name, setName } = useRemoteMicName();

  const isSmallScreen = useResponsiveValue({ xs: false, sm: true });
  return (
    <>
      <QRCodeModal open={isQRCodeModalOpen} closeModal={() => setIsQRCodeModalOpen(false)} />
      <RenameModal
        open={isRenameModalOpen}
        currentName={name}
        onClose={() => setIsRenameModalOpen(false)}
        onSave={(newName) => {
          setName(newName);
          RemoteMicClient.renameSelf(newName);
        }}
      />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-black px-3 py-1.5 text-white">
        <div className="text-md flex items-center gap-1.5 font-bold">
          <div
            className={`text-center ${dotColorByStatus[connectionStatus]} flex w-10 items-center justify-center`}
            aria-hidden="true">
            <Icon icon="mdi:circle" size={6} />
          </div>
          <span data-test="connection-status">
            {connectionStatus === 'connected' ? <Ping /> : connectionStatus.toUpperCase()}
          </span>
        </div>
        <button
          type="button"
          className="ph-no-capture text-md flex max-w-[40vw] items-center gap-1 font-bold text-white/90"
          onClick={() => setIsRenameModalOpen(true)}
          data-test="topbar-player-name">
          <span className="truncate">{name}</span>
          <Icon icon="ic:baseline-edit" size={4} className="shrink-0 opacity-70" />
        </button>
        <div className="flex items-center justify-end gap-2">
          <Button
            size="mini"
            fullWidth={false}
            onClick={() => setIsQRCodeModalOpen(true)}
            leftIcon={<Icon icon="ic:baseline-qr-code-2" />}
            aria-label="Connect phone">
            {roomId && isSmallScreen ? roomId.toUpperCase() : undefined}
          </Button>
          <FullscreenButton size="mini" />
        </div>
      </div>
    </>
  );
}

export default TopBar;
