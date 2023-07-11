import styled from '@emotion/styled';
import NoSleep from '@uriopass/nosleep.js';
import { useBackground } from 'Elements/LayoutWithBackground';
import NormalizeFontSize from 'Elements/NormalizeFontSize';
import events from 'GameEvents/GameEvents';
import { useEventEffect, useEventListener } from 'GameEvents/hooks';
import BottomBar from 'Scenes/RemoteMic/BottomBar';
import Microphone from 'Scenes/RemoteMic/Panels/Microphone';
import ConfirmReadiness from 'Scenes/RemoteMic/Panels/Microphone/ConfirmReadiness';
import RemoteSongList from 'Scenes/RemoteMic/Panels/RemoteSongList';
import { useState } from 'react';

interface Props {
    roomId: string;
}

const noSleep = new NoSleep();

export type ConnectionStatuses = Parameters<typeof events.karaokeConnectionStatusChange.dispatch>[0] | 'uninitialised';

export type PhoneTabs = 'microphone' | 'song-list' | 'settings';

function RemoteMic({ roomId }: Props) {
    useBackground(true);
    const [activeTab, setActiveTab] = useState<PhoneTabs>('microphone');

    const [connectionStatus, connectionError] = useEventListener(events.karaokeConnectionStatusChange) ?? [
        'uninitialised',
    ];

    const [monitoringStarted, setMonitoringStarted] = useState(false);
    useEventEffect(events.micMonitoringStarted, () => setMonitoringStarted(true));
    useEventEffect(events.micMonitoringStopped, () => setMonitoringStarted(false));

    const [isKeepAwakeOn, setIsKeepAwakeOn] = useState(false);

    const setKeepAwake = async (turnOn: boolean) => {
        try {
            if (turnOn && !noSleep.isEnabled) {
                await noSleep.enable();
            } else if (!turnOn && noSleep.isEnabled) {
                await noSleep.disable();
            }
            setIsKeepAwakeOn(turnOn);
        } catch (e) {
            console.warn('Couldnt set wakelock', e);
        }
    };

    const onConfirm = () => {
        setKeepAwake(true);
    };
    const isConnected = connectionStatus === 'connected';
    return (
        <>
            <ConfirmReadiness onConfirm={onConfirm} />
            <NormalizeFontSize size={10} />
            <Container id="phone-ui-container">
                {activeTab === 'microphone' && (
                    <Microphone
                        roomId={roomId}
                        monitoringStarted={monitoringStarted}
                        setMonitoringStarted={setMonitoringStarted}
                        connectionStatus={connectionStatus}
                        setIsKeepAwakeOn={setIsKeepAwakeOn}
                        isKeepAwakeOn={isKeepAwakeOn}
                        connectionError={connectionError}
                    />
                )}
                {activeTab === 'song-list' && (
                    <RemoteSongList
                        roomId={roomId}
                        monitoringStarted={monitoringStarted}
                        setMonitoringStarted={setMonitoringStarted}
                        connectionStatus={connectionStatus}
                        setIsKeepAwakeOn={setIsKeepAwakeOn}
                        isKeepAwakeOn={isKeepAwakeOn}
                        connectionError={connectionError}
                    />
                )}
                {isConnected && <BottomBar setActiveTab={setActiveTab} active={activeTab} />}
            </Container>
        </>
    );
}
export default RemoteMic;

const Container = styled.div`
    margin: 0 auto;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
    height: 100vh;
    max-height: 800px;

    @media (max-height: 500px) and (min-aspect-ratio: 16/10) {
        max-width: 960px;
        flex-wrap: nowrap;
        flex-direction: row;
    }
`;
