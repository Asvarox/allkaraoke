import styled from '@emotion/styled';
import { QrCode2, Warning, Wifi } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { Input } from 'Elements/Input';
import { MenuButton } from 'Elements/Menu';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { ConnectionStatuses } from 'Scenes/RemoteMic/RemoteMic';
import { MAX_NAME_LENGTH } from 'consts';
import { PeerErrorType } from 'interfaces';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import createPersistedState from 'use-persisted-state';

interface Props {
    roomId: string;
    isVisible: boolean;
    connectionStatus: ConnectionStatuses;
    onConnect: (silent: boolean) => void;
    connectionError?: PeerErrorType;
}

const usePersistedName = createPersistedState<string>('remote_mic_name');

function Connect({ isVisible, roomId, connectionStatus, onConnect, connectionError }: Props) {
    const [name, setName] = usePersistedName('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const disabled = connectionStatus !== 'uninitialised' && connectionStatus !== 'error';

    const connectToServer = (silent = false) => {
        WebRTCClient.connect(roomId, name, silent);
        onConnect(silent);
    };

    const handleConnect: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        if (name === '') {
            inputRef.current?.focus();
        } else {
            connectToServer();
        }
    };

    useEffect(() => {
        inputRef.current?.focus();

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
                <Input
                    maxLength={MAX_NAME_LENGTH}
                    focused={false}
                    label="Name"
                    placeholder="Enter your name…"
                    value={name}
                    onChange={setName}
                    ref={inputRef}
                    disabled={disabled}
                    autoFocus
                    data-test="player-name-input"
                />
                <MenuButton type="submit" disabled={disabled} data-test="connect-button">
                    {connectionStatus === 'connecting' && <CircularProgress size={'1em'} />}
                    {connectionStatus === 'uninitialised' ? 'Connect' : connectionStatus.toUpperCase()}
                </MenuButton>
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
            </Form>
        </>
    ) : null;
}
export default Connect;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;
