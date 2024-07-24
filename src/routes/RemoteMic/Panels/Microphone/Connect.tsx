import styled from '@emotion/styled';
import { QrCode2, Warning, Wifi } from '@mui/icons-material';
import { MAX_NAME_LENGTH } from 'consts';
import { Input } from 'modules/Elements/Input';
import Loader from 'modules/Elements/Loader';
import { MenuButton } from 'modules/Elements/Menu';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import { GAME_CODE_LENGTH } from 'modules/RemoteMic/Network/Server/NetworkServer';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import storage from 'modules/utils/storage';
import posthog from 'posthog-js';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import ConfirmWifiModal from 'routes/RemoteMic/Components/ConfrimWifiModal';
import { ConnectionStatuses } from 'routes/RemoteMic/RemoteMic';
import createPersistedState from 'use-persisted-state';

interface Props {
  roomId: string | null;
  isVisible: boolean;
  connectionStatus: ConnectionStatuses;
  onConnect: (silent: boolean) => void;
  connectionError?: transportErrorReason;
}

const usePersistedName = createPersistedState<string>('remote_mic_name');

function Connect({ isVisible, roomId, connectionStatus, onConnect, connectionError }: Props) {
  const [name, setName] = usePersistedName('');
  const [errorReset, setErrorReset] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const secondInputRef = useRef<HTMLInputElement | null>(null);
  const [customRoomId, setCustomRoomId] = useState<string>(roomId ?? '');
  const navigate = useSmoothNavigate();

  const disabled = connectionStatus !== 'uninitialised' && connectionStatus !== 'error';

  useEffect(() => {
    if (connectionStatus === 'connected' && !roomId) {
      navigate(`remote-mic/`, { room: customRoomId });
    }
  }, [connectionStatus, roomId, customRoomId]);

  const connectToServer = (silent = false) => {
    RemoteMicClient.connect(customRoomId, name, silent);
    onConnect(silent);
  };

  const handleConnect: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setErrorReset(false);

    if (!roomId && customRoomId.length !== GAME_CODE_LENGTH) {
      firstInputRef.current?.focus();
    } else if (name === '') {
      (secondInputRef.current ?? firstInputRef.current)?.focus();
    } else {
      connectToServer();
    }
  };

  useEffect(() => {
    posthog.capture(roomId ? 'remote-mic-qrcode' : 'remote-mic-manual');
    firstInputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (storage.session.getItem('reload-mic-request') !== null) {
      // give other components option to read the property on mount before its removed
      global.setTimeout(() => storage.session.removeItem('reload-mic-request'), 1);
      connectToServer(true);
    }
  }, []);

  const [showConnectionTip, setShowConnectionTip] = useState(false);

  useEffect(() => {
    setShowConnectionTip(false);
    if (connectionStatus === 'connecting' || connectionStatus === 'reconnecting') {
      const timeout = setTimeout(() => setShowConnectionTip(true), 2000);

      return () => clearTimeout(timeout);
    }
  }, [connectionStatus]);

  const shouldShowError = connectionStatus === 'error' && !errorReset;

  return isVisible ? (
    <>
      {roomId?.startsWith('p') && (
        <ConfirmWifiModal
          onClose={() => {
            firstInputRef.current?.focus();
          }}
        />
      )}
      <Form onSubmit={handleConnect}>
        {!disabled && (
          <GCInput
            ref={firstInputRef}
            placeholder="_____"
            label="Game code"
            autoCapitalize={'characters'}
            autoComplete={'off'}
            onChange={setCustomRoomId}
            value={customRoomId}
            maxLength={GAME_CODE_LENGTH}
            focused={false}
            autoFocus
            data-test="game-code-input"
            onFocus={() => {
              if (connectionStatus === 'error') {
                setErrorReset(true);
              }
            }}
            onPaste={(event) => {
              // When Ctrl+V, remove whitespaces before changing the value
              event.preventDefault();
              // @ts-expect-error
              let paste = (event.clipboardData || global.clipboardData).getData('text');
              paste = paste.replace(/\s/g, '');
              setCustomRoomId(paste.slice(0, GAME_CODE_LENGTH));
            }}
          />
        )}
        <Input
          maxLength={MAX_NAME_LENGTH}
          focused={false}
          label="Your name"
          placeholder="Enter your name…"
          value={name}
          onChange={setName}
          ref={roomId ? firstInputRef : secondInputRef}
          disabled={disabled}
          autoFocus
          data-test="player-name-input"
        />
        <ConnectButton type="submit" disabled={disabled} data-test="connect-button">
          {connectionStatus === 'connecting' && <Loader size={'1em'} />}
          {connectionStatus === 'uninitialised' || errorReset ? 'Connect' : connectionStatus.toUpperCase()}
        </ConnectButton>
      </Form>
      {(showConnectionTip || shouldShowError) && (
        <>
          {showConnectionTip && <h3>If it doesn't connect</h3>}
          {shouldShowError && (
            <>
              <h3>
                <strong>
                  <Warning />
                </strong>{' '}
                Could not connect:
              </h3>
              <h6>
                Error code: <strong>{connectionError}</strong>
              </h6>
              <br />
              {connectionError === 'peer-unavailable' ? (
                <>
                  <h4>
                    {roomId === undefined ? 'Game with this code not found 🤔' : 'The game seems to be offline 🤔'}
                  </h4>
                  {roomId === undefined && (
                    <h5>
                      1. Is the code <strong>{customRoomId.toUpperCase()}</strong> correct?
                    </h5>
                  )}
                  <h5>
                    {roomId === undefined ? 2 : 1}. Refresh (<strong>F5</strong>) the Karaoke Game on the PC
                  </h5>
                  {roomId !== undefined && (
                    <h5>
                      2. Scan the{' '}
                      <strong>
                        <QrCode2 /> QR Code
                      </strong>{' '}
                      again
                    </h5>
                  )}
                  <h5>
                    3. Make sure you are in the same{' '}
                    <strong>
                      <Wifi /> Wi-Fi
                    </strong>
                  </h5>
                </>
              ) : connectionError === 'network' ? (
                <>
                  <h4>No internet access 💀</h4>
                  <h5>
                    Make sure you are in the same{' '}
                    <strong>
                      <Wifi /> Wi-Fi
                    </strong>
                    and that it has internet connection
                  </h5>
                </>
              ) : (
                <>
                  <h5>
                    1. Make sure you are in the same{' '}
                    <strong>
                      <Wifi /> Wi-Fi
                    </strong>
                  </h5>
                  <h5>
                    2. Refresh (<strong>F5</strong>) the Karaoke Game on the PC
                  </h5>
                  <h5>
                    3. Scan the{' '}
                    <strong>
                      <QrCode2 /> QR Code
                    </strong>{' '}
                    again
                  </h5>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  ) : null;
}
export default Connect;

const Form = styled.form`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConnectButton = styled(MenuButton)`
  margin-bottom: 0;
  height: 72px;
`;

const GCInput = styled(Input)`
  input {
    letter-spacing: 2rem;
    text-align: center;
    text-transform: uppercase;
  }
`;
