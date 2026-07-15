import { Icon } from '@iconify-icon/react';
import { AnimatePresence, motion } from 'motion/react';
import { ComponentRef, FormEventHandler, useEffect, useRef, useState } from 'react';
import createPersistedState from 'use-persisted-state';

import { MAX_NAME_LENGTH } from '~/consts';
import { Menu } from '~/modules/elements/akui/menu';
import Typography from '~/modules/elements/akui/primitives/typography';
import { Input } from '~/modules/elements/input';
import Loader from '~/modules/elements/loader';
import { MenuButton } from '~/modules/elements/menu';
import Modal from '~/modules/elements/modal';
import { transportErrorReason } from '~/modules/remote-mic/network/client/network-client';
import { GAME_CODE_LENGTH } from '~/modules/remote-mic/network/server/network-server';
import ConfirmWifiModal from '~/routes/remote-mic/components/confrim-wifi-modal';
import { ConnectionStatuses } from '~/routes/remote-mic/remote-mic';

interface Props {
  roomId: string | null;
  onConnect: (roomId: string, name: string) => void;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
}

const usePersistedName = createPersistedState<string>('remote_mic_name');

export default function StepEnterDetails({ roomId, onConnect, connectionStatus, connectionError }: Props) {
  const [name, setName] = usePersistedName('');
  // Start as reset if already in error on mount — avoids re-showing the modal when switching tabs back
  const [errorReset, setErrorReset] = useState(() => connectionStatus === 'error');
  const [customRoomId, setCustomRoomId] = useState<string>(roomId ?? '');
  const gameCodeInputRef = useRef<ComponentRef<typeof Input>>(null);
  const nameInputRef = useRef<ComponentRef<typeof Input>>(null);

  const disabled = connectionStatus !== 'uninitialised' && connectionStatus !== 'error';

  const focusNextInput = (triggerValidation = false) => {
    if (customRoomId.length !== GAME_CODE_LENGTH) {
      gameCodeInputRef.current?.element?.focus();
      triggerValidation && gameCodeInputRef.current?.triggerValidationError('Provide a valid game code');
      return true;
    } else if (name === '') {
      nameInputRef.current?.element?.focus();
      triggerValidation && nameInputRef.current?.triggerValidationError('Provide your name');
      return true;
    }
    return false;
  };

  const handleConnect: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setErrorReset(false);

    if (!focusNextInput(true)) {
      // customRoomId takes priority — user may have manually corrected the code from QR
      onConnect(customRoomId || roomId!, name);
    }
  };

  useEffect(() => {
    focusNextInput(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus the first empty input once on mount
  }, []);

  const shouldShowError = connectionStatus === 'error' && !errorReset;
  const isConnecting = connectionStatus === 'connecting' || connectionStatus === 'reconnecting';

  return (
    <>
      {roomId?.startsWith('p') && <ConfirmWifiModal onClose={() => gameCodeInputRef.current?.element?.focus()} />}
      <AnimatePresence>
        {isConnecting && (
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <Loader />
            <span className="typography text-xl text-white">Connecting…</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex w-full flex-1 flex-col justify-center">
        <form className="flex w-full flex-col gap-4 md:gap-8" onSubmit={handleConnect}>
          <Input
            className="[&_input]:text-center [&_input]:tracking-[1.25rem] [&_input]:uppercase"
            ref={gameCodeInputRef}
            placeholder="_____"
            label="Game code"
            autoCapitalize={'characters'}
            autoComplete={'off'}
            onChange={setCustomRoomId}
            value={customRoomId}
            maxLength={GAME_CODE_LENGTH}
            focused={false}
            disabled={disabled}
            autoFocus
            data-test="game-code-input"
            onFocus={() => {
              if (connectionStatus === 'error') {
                setErrorReset(true);
              }
            }}
            onPaste={(event) => {
              // When pasting, strip whitespace before setting the value
              event.preventDefault();
              // @ts-expect-error clipboardData is not in the types
              let paste = (event.clipboardData || global.clipboardData).getData('text');
              paste = paste.replace(/\s/g, '');
              setCustomRoomId(paste.slice(0, GAME_CODE_LENGTH));
            }}
          />
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
          <MenuButton className="h-24" type="submit" disabled={disabled} data-test="connect-button">
            Connect
          </MenuButton>
        </form>
      </div>
      <Modal open={shouldShowError} onClose={() => setErrorReset(true)} data-test="connection-error-modal" withPortal>
        <Menu>
          <Menu.Header>Couldn&#39;t connect</Menu.Header>
          <Typography>
            {roomId ? (
              <>
                The game seems to be <strong>offline 🤔</strong>
              </>
            ) : (
              'Game with this code not found 🤔'
            )}
          </Typography>
          <Typography>
            <ul className="list-disc pl-12 text-sm leading-7">
              {!roomId && (
                <li>
                  Is the code <strong>{customRoomId.toUpperCase()}</strong> correct?
                </li>
              )}
              <li>
                Refresh (<strong>F5</strong>) the Karaoke Game on the PC.
              </li>
              {roomId && (
                <li className="inline-flex items-center gap-1">
                  Scan the{' '}
                  <strong className="inline-flex items-center gap-1">
                    <Icon icon="mdi:qrcode-scan" /> QR Code
                  </strong>{' '}
                  again
                </li>
              )}
              <li className="inline-flex items-center gap-1">
                Make sure you are in the same{' '}
                <strong className="inline-flex items-center gap-1">
                  <Icon icon="mdi:wifi" /> Wi-Fi
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
  );
}
