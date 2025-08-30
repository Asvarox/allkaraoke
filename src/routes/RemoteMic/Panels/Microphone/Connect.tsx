import styled from '@emotion/styled';
import { QrCode2, Wifi } from '@mui/icons-material';
import { MAX_NAME_LENGTH } from 'consts';
import { Menu } from 'modules/Elements/AKUI/Menu';
import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import { Input } from 'modules/Elements/Input';
import Loader from 'modules/Elements/Loader';
import { MenuButton } from 'modules/Elements/Menu';
import Modal from 'modules/Elements/Modal';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import { GAME_CODE_LENGTH } from 'modules/RemoteMic/Network/Server/NetworkServer';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import storage from 'modules/utils/storage';
import posthog from 'posthog-js';
import { ComponentRef, FormEventHandler, useCallback, useEffect, useRef, useState } from 'react';
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
  const gameCodeInputRef = useRef<ComponentRef<typeof Input>>(null);
  const nameInputRef = useRef<ComponentRef<typeof Input>>(null);
  const [customRoomId, setCustomRoomId] = useState<string>(roomId ?? '');
  const navigate = useSmoothNavigate();

  const disabled = connectionStatus !== 'uninitialised' && connectionStatus !== 'error';
  const connected = connectionStatus === 'connected';

  const focusNextInput = useCallback(
    (triggerValidation = false) => {
      if (!roomId && customRoomId.length !== GAME_CODE_LENGTH) {
        gameCodeInputRef.current?.element?.focus();
        triggerValidation && gameCodeInputRef.current?.triggerValidationError('Provide a valid game code');
        return true;
      } else if (name === '') {
        nameInputRef.current?.element?.focus();
        triggerValidation && nameInputRef.current?.triggerValidationError('Provide your name');
        return true;
      }
      return false;
    },
    [customRoomId, roomId, name],
  );

  useEffect(() => {
    if (connected && !roomId) {
      navigate(`remote-mic/`, { room: customRoomId });
    }
  }, [connectionStatus, roomId, customRoomId, connected]);

  const connectToServer = (silent = false) => {
    RemoteMicClient.connect(customRoomId, name, silent);
    onConnect(silent);
  };

  const handleConnect: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setErrorReset(false);

    if (!focusNextInput(true)) {
      connectToServer();
    }
  };

  useEffect(() => {
    posthog.capture(roomId ? 'remote-mic-qrcode' : 'remote-mic-manual');
    focusNextInput(false);
  }, []);
  useEffect(() => {
    if (storage.session.getItem('reload-mic-request') !== null) {
      // give other components option to read the property on mount before its removed
      globalThis.setTimeout(() => storage.session.removeItem('reload-mic-request'), 1);
      connectToServer(true);
    }
  }, []);

  const shouldShowError = connectionStatus === 'error' && !errorReset;

  return isVisible ? (
    <>
      {roomId?.startsWith('p') && (
        <ConfirmWifiModal
          onClose={() => {
            gameCodeInputRef.current?.element?.focus();
          }}
        />
      )}
      <form className="flex flex-col gap-8" onSubmit={handleConnect}>
        {!connected && (
          <GCInput
            ref={gameCodeInputRef}
            placeholder="_____"
            label="Game code"
            autoCapitalize={'characters'}
            autoComplete={'off'}
            onChange={setCustomRoomId}
            value={customRoomId}
            maxLength={GAME_CODE_LENGTH}
            focused={false}
            disabled={connected}
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
              // @ts-expect-error clipboardData is not in the types
              let paste = (event.clipboardData || globalThis.clipboardData).getData('text');
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
          ref={nameInputRef}
          disabled={disabled}
          autoFocus
          data-test="player-name-input"
        />
        {!connected && (
          <MenuButton className="h-28" type="submit" disabled={disabled} data-test="connect-button">
            {connectionStatus === 'connecting' && <Loader size={'1em'} />}
            {connectionStatus === 'uninitialised' || errorReset ? 'Connect' : connectionStatus.toUpperCase()}
          </MenuButton>
        )}
      </form>
      <Modal open={shouldShowError} onClose={() => setErrorReset(true)} data-test="connection-error-modal">
        <Menu>
          <Menu.Header>Couldn&#39;t connect</Menu.Header>
          <Typography>{roomId ? 'The game seems to be offline 🤔' : 'Game with this code not found 🤔'}</Typography>
          <Typography>
            <ul className="list-disc pl-12 text-sm leading-12">
              {!roomId && (
                <li>
                  Is the code <strong>{customRoomId.toUpperCase()}</strong> correct?
                </li>
              )}
              <li>
                Refresh (<strong>F5</strong>) the Karaoke Game on the PC.
              </li>
              {roomId && (
                <li>
                  Scan the{' '}
                  <strong>
                    <QrCode2 /> QR Code
                  </strong>{' '}
                  again
                </li>
              )}
              <li>
                Make sure you are in the same{' '}
                <strong>
                  <Wifi /> Wi-Fi
                </strong>
              </li>
            </ul>
          </Typography>
          <Typography className="text-sm">
            Error code: <strong>{connectionError}</strong>
          </Typography>
          <Menu.Button size="small" onClick={() => setErrorReset(true)}>
            Close
          </Menu.Button>
        </Menu>
      </Modal>
    </>
  ) : null;
}
export default Connect;

const GCInput = styled(Input)`
  input {
    letter-spacing: 2rem;
    text-align: center;
    text-transform: uppercase;
  }
`;
