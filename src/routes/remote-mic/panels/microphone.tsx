import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Menu } from '~/modules/elements/akui/menu';
import Loader from '~/modules/elements/loader';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import { transportErrorReason } from '~/modules/remote-mic/network/client/network-client';
import isDev from '~/modules/utils/is-dev';
import storage from '~/modules/utils/storage';
import usePermissions from '~/routes/remote-mic/hooks/use-permissions';
import ConnectionWizard from '~/routes/remote-mic/panels/microphone/connection-wizard/index';
import RemoteMicKeyboard from '~/routes/remote-mic/panels/microphone/keyboard';
import MicPreview from '~/routes/remote-mic/panels/microphone/mic-preview';
import { ConnectionStatuses } from '~/routes/remote-mic/remote-mic';
import { AutoEnableFullscreenSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  roomId: string | null;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
  isKeepAwakeOn: boolean;
  setIsKeepAwakeOn: (keepAwake: boolean) => void;
  monitoringStarted: boolean;
  setMonitoringStarted: (micMonitoring: boolean) => void;
}

function Microphone({ roomId, monitoringStarted, setIsKeepAwakeOn, connectionError, connectionStatus }: Props) {
  const permissions = usePermissions();
  const [searchActive, setSearchActive] = useState(false);
  const [autoEnableFullscreen] = useSettingValue(AutoEnableFullscreenSetting);
  const [wizardComplete, setWizardComplete] = useState(() => connectionStatus === 'connected');
  const [isAutoReconnecting, setIsAutoReconnecting] = useState(false);

  // Auto-reconnect: if the host requested a page reload, skip the wizard and reconnect silently
  useEffect(() => {
    if (storage.session.getItem('reload-mic-request') !== null) {
      global.setTimeout(() => storage.session.removeItem('reload-mic-request'), 1);
      setIsAutoReconnecting(true);
      setWizardComplete(true);
      const name = storage.local.getItem<string>('remote_mic_name') ?? '';
      RemoteMicClient.connect(roomId ?? '', name, true);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isConnected = connectionStatus === 'connected';

  // Clear auto-reconnecting state once connected
  useEffect(() => {
    if (isConnected && isAutoReconnecting) {
      setIsAutoReconnecting(false);
    }
  }, [isConnected, isAutoReconnecting]);

  const onWizardComplete = async () => {
    setWizardComplete(true);
    setIsKeepAwakeOn(true);

    try {
      if (!isDev() && autoEnableFullscreen) {
        await document.body.requestFullscreen();
        global.screen.orientation.unlock();
        await global.screen.orientation.lock?.('portrait');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // The wizard controls its own completion via onWizardComplete — do not unmount
  // it early based on connection status, or the minimum display timer in StepConnecting is bypassed
  const showWizard = !wizardComplete;

  if (showWizard) {
    return (
      <div className="flex h-full flex-col overflow-auto">
        <ConnectionWizard
          roomId={roomId}
          connectionStatus={connectionStatus}
          connectionError={connectionError}
          onWizardComplete={onWizardComplete}
        />
      </div>
    );
  }

  if (isAutoReconnecting && !isConnected) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Loader />
        <span className="typography text-xl text-white">Reconnecting…</span>
      </div>
    );
  }

  const isReconnecting = connectionStatus === 'reconnecting' || connectionStatus === 'disconnected';

  return (
    <div className="relative flex h-full flex-col">
      <div className="text-md flex h-full flex-col items-center justify-center gap-4 overflow-auto px-4 pt-4 md:flex-row">
        <div
          className={`flex w-full flex-1 flex-col justify-center gap-4 transition-all duration-300 ease-in-out md:mt-0 md:flex md:flex-col ${searchActive ? 'mt-[-100%]' : 'mt-0'}`}>
          <MicPreview isVisible={isConnected} isMicOn={monitoringStarted} isConnected={isConnected} />
        </div>
        <div className="flex-1">
          {permissions === 'write' && <RemoteMicKeyboard onSearchStateChange={setSearchActive} />}
          {permissions === 'read' && (
            <Menu.HelpText className="pb-12" data-test="no-permissions-message">
              No permission to control the game. Go to in-game <strong>Settings</strong> menu ➔{' '}
              <strong>Remote Microphones Settings</strong> to manage them.
            </Menu.HelpText>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isReconnecting && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <Loader />
            <span className="typography text-xl text-white">Reconnecting…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Microphone;
