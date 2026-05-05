import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import Loader from '~/modules/Elements/Loader';
import RemoteMicClient from '~/modules/RemoteMic/Network/Client';
import { transportErrorReason } from '~/modules/RemoteMic/Network/Client/NetworkClient';
import isDev from '~/modules/utils/isDev';
import storage from '~/modules/utils/storage';
import ConnectionWizard from '~/routes/RemoteMic/Panels/Microphone/ConnectionWizard';
import RemoteMicKeyboard from '~/routes/RemoteMic/Panels/Microphone/Keyboard';
import MicPreview from '~/routes/RemoteMic/Panels/Microphone/MicPreview';
import { ConnectionStatuses } from '~/routes/RemoteMic/RemoteMic';
import usePermissions from '~/routes/RemoteMic/hooks/usePermissions';
import { AutoEnableFullscreenSetting, useSettingValue } from '~/routes/Settings/SettingsState';

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
      const persistedName = localStorage.getItem('remote_mic_name');
      const name = persistedName ? JSON.parse(persistedName) : '';
      RemoteMicClient.connect(roomId ?? '', name, true);
    }
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
      <div className="landscap:flex-row landscap:pt-0 text-md landscap:gap-4 flex h-full flex-col items-center justify-center gap-4 overflow-auto px-4 pt-16">
        <div
          className={`landscap:mt-0 landscap:flex flex-1.5 landscap:flex-col flex w-full flex-col justify-center gap-4 transition-all duration-300 ease-in-out ${searchActive ? 'mt-[-100%]' : 'mt-0'}`}>
          <MicPreview isVisible={isConnected} isMicOn={monitoringStarted} isConnected={isConnected} />
        </div>
        <div>
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
