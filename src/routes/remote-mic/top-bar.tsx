import { useState } from 'react';

import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import FullscreenButton from '~/modules/toolbar/fullscreen';
import QRCodeModal from '~/modules/toolbar/qr-code-modal';
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
            <Icon icon="mdi:circle" size={6} />
          </div>
          <span data-test="connection-status">
            {connectionStatus === 'connected' ? <Ping /> : connectionStatus.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="mini"
            onClick={() => setIsQRCodeModalOpen(true)}
            leftIcon={<Icon icon="ic:baseline-qr-code-2" />}
            aria-label="Connect phone"
          />
          <FullscreenButton size="mini" />
        </div>
      </div>
    </>
  );
}

export default TopBar;
