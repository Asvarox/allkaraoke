import { ComponentRef, FormEventHandler, useEffect, useRef, useState } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
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
  onConnect: (roomId: string) => void;
  connectionStatus: ConnectionStatuses;
  connectionError?: transportErrorReason;
}

// Milliseconds between each character reveal when a game code preloaded from the URL is "typed" in
const AUTO_TYPE_CHAR_DELAY_MS = 90;

export default function StepEnterCode({ roomId, onConnect, connectionStatus, connectionError }: Props) {
  const [customRoomId, setCustomRoomId] = useState('');
  // While true, the code is being revealed programmatically — the field is locked to input
  const [isAutoTyping, setIsAutoTyping] = useState(!!roomId);
  // Start as reset if already in error on mount — avoids re-showing the modal when switching tabs back
  const [errorReset, setErrorReset] = useState(() => connectionStatus === 'error');
  const gameCodeInputRef = useRef<ComponentRef<typeof Input>>(null);
  // Guards against submitting the same code twice — connectionStatus lags a render behind
  // RemoteMicClient.connect() actually being called, so a manual Enter/click can otherwise race
  // the auto-connect effect while both still see connectionStatus as 'uninitialised'
  const submittedCodeRef = useRef<string | null>(null);

  const disabled = isAutoTyping || (connectionStatus !== 'uninitialised' && connectionStatus !== 'error');

  // Reveal a preloaded game code one character at a time, as if it were being typed
  useEffect(() => {
    if (!roomId) return;
    const gameCodeChars = roomId.toUpperCase().slice(0, GAME_CODE_LENGTH);
    let revealedCharCount = 0;
    const interval = setInterval(() => {
      revealedCharCount += 1;
      setCustomRoomId(gameCodeChars.slice(0, revealedCharCount));
      if (revealedCharCount >= gameCodeChars.length) {
        clearInterval(interval);
        setIsAutoTyping(false);
      }
    }, AUTO_TYPE_CHAR_DELAY_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run the reveal once, driven by the initial roomId only
  }, []);

  // Focus the field as soon as it's interactive — either immediately (manual entry) or once the
  // auto-typed reveal finishes
  useEffect(() => {
    if (!isAutoTyping) gameCodeInputRef.current?.element?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoTyping]);

  // Auto-connect as soon as a full code is in place — whether typed by hand, pasted, or revealed above.
  // connectionStatus is intentionally excluded from deps: it's only read as a gate here, not something
  // that should retrigger this effect (that would immediately re-fire once status flips to 'connecting').
  useEffect(() => {
    if (isAutoTyping) return;
    if (
      customRoomId.length === GAME_CODE_LENGTH &&
      (connectionStatus === 'uninitialised' || connectionStatus === 'error') &&
      submittedCodeRef.current !== customRoomId
    ) {
      submittedCodeRef.current = customRoomId;
      onConnect(customRoomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customRoomId, isAutoTyping]);

  // A failed attempt re-enables the form for a manual retry — allow resubmitting the same code
  useEffect(() => {
    if (connectionStatus === 'error') {
      submittedCodeRef.current = null;
    }
  }, [connectionStatus]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setErrorReset(false);

    if (customRoomId.length !== GAME_CODE_LENGTH) {
      gameCodeInputRef.current?.triggerValidationError('Provide a valid game code');
      gameCodeInputRef.current?.element?.focus();
      return;
    }
    if (submittedCodeRef.current === customRoomId) return;
    submittedCodeRef.current = customRoomId;
    onConnect(customRoomId);
  };

  const shouldShowError = connectionStatus === 'error' && !errorReset;
  const isConnecting = connectionStatus === 'connecting' || connectionStatus === 'reconnecting';

  return (
    <>
      {roomId?.startsWith('p') && <ConfirmWifiModal onClose={() => gameCodeInputRef.current?.element?.focus()} />}
      <div className="flex w-full flex-1 flex-col justify-center">
        <form className="flex w-full flex-col gap-4 md:gap-8" onSubmit={handleSubmit}>
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
          <MenuButton className="h-24" type="submit" disabled={disabled} data-test="connect-button">
            {isConnecting ? <Loader size="1.5em" /> : 'Connect'}
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
