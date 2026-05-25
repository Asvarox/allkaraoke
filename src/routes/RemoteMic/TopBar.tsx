import { Icon } from '@iconify-icon/react';
import { QrCode2 } from '@mui/icons-material';
import { useState } from 'react';
import FullscreenButton from '~/modules/Toolbar/Fullscreen';
import QRCodeModal from '~/modules/Toolbar/QRCodeModal';
import Ping from '~/routes/RemoteMic/Panels/Microphone/Ping';
import { ConnectionStatuses } from '~/routes/RemoteMic/RemoteMic';

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
}

function TopBar({ connectionStatus }: Props) {
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);

  return (
    <>
      <QRCodeModal open={isQRCodeModalOpen} closeModal={() => setIsQRCodeModalOpen(false)} />
      <div className="flex items-center justify-between bg-black px-3 py-1.5 text-white [&_svg]:h-6 [&_svg]:w-6 [&_svg]:fill-white">
        <div className="flex items-center gap-1.5 text-sm">
          <div
            className={`text-center ${dotColorByStatus[connectionStatus]} flex w-10 items-center justify-center`}
            aria-hidden="true">
            <Icon icon="mdi:circle" />
          </div>
          <span data-test="connection-status">
            {connectionStatus === 'connected' ? <Ping /> : connectionStatus.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQRCodeModalOpen(true)}
            className="cursor-pointer rounded p-1 hover:bg-white/10"
            aria-label="Connect phone">
            <QrCode2 />
          </button>
          <FullscreenButton />
        </div>
      </div>
    </>
  );
}

export default TopBar;
