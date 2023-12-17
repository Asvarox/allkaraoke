import styled from '@emotion/styled';
import { QrCode2, Warning, Wifi } from '@mui/icons-material';
import { Input } from 'Elements/Input';
import Loader from 'Elements/Loader';
import { MenuButton } from 'Elements/Menu';
import RemoteMicClient from 'RemoteMic/Network/Client';
import { transportErrorReason } from 'RemoteMic/Network/Client/NetworkClient';
import { GAME_CODE_LENGTH } from 'RemoteMic/Network/Server/NetworkServer';
import { ConnectionStatuses } from 'Scenes/RemoteMic/RemoteMic';
import { MAX_NAME_LENGTH } from 'consts';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import createPersistedState from 'use-persisted-state';

interface Props {
  roomId: string | undefined;
  isVisible: boolean;
  connectionStatus: ConnectionStatuses;
  onConnect: (silent: boolean) => void;
  connectionError?: transportErrorReason;
}

const usePersistedName = createPersistedState<string>('remote_mic_name');

function Connect({ isVisible, roomId, connectionStatus, onConnect, connectionError }: Props) {
  const [name, setName] = usePersistedName('');
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [customRoomId, setCustomRoomId] = useState<string>('');
  const navigate = useSmoothNavigate();

  const disabled = connectionStatus !== 'uninitialised' && connectionStatus !== 'error';

  useEffect(() => {
    if (connectionStatus === 'connected' && !roomId) {
      navigate(`remote-mic/${customRoomId}`);
    }
  }, [connectionStatus, roomId, customRoomId]);

  const connectToServer = (silent = false) => {
    RemoteMicClient.connect(roomId ?? customRoomId, name, silent);
    onConnect(silent);
  };

  const handleConnect: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (name === '') {
      firstInputRef.current?.focus();
    } else {
      connectToServer();
    }
  };

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (window.sessionStorage.getItem('reload-mic-request') !== null) {
      // give other components option to read the property on mount before its removed
      window.setTimeout(() => window.sessionStorage.removeItem('reload-mic-request'), 1);
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

  return isVisible ? (
    <>
      <Form onSubmit={handleConnect}>
        {roomId === undefined && (
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
            onPaste={(event) => {
              // When Ctrl+V, remove whitespaces before changing the value
              event.preventDefault();
              // @ts-expect-error
              let paste = (event.clipboardData || window.clipboardData).getData('text');
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
          ref={roomId ? firstInputRef : undefined}
          disabled={disabled}
          autoFocus
          data-test="player-name-input"
        />
        <ConnectButton type="submit" disabled={disabled} data-test="connect-button">
          {connectionStatus === 'connecting' && <Loader size={'1em'} />}
          {connectionStatus === 'uninitialised' ? 'Connect' : connectionStatus.toUpperCase()}
        </ConnectButton>
      </Form>
      {(showConnectionTip || connectionError) && (
        <>
          {showConnectionTip && <h3>If it doesn't connect</h3>}
          {connectionError && (
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
            </>
          )}
          {connectionError === 'peer-unavailable' ? (
            <>
              <h4>The game seems to be offline 🤔</h4>
              <h5>
                1. Refresh (<strong>F5</strong>) the Karaoke Game on the PC
              </h5>
              <h5>
                2. Scan the{' '}
                <strong>
                  <QrCode2 /> QR Code
                </strong>{' '}
                again
              </h5>
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
