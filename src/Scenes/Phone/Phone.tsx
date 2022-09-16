import styled from '@emotion/styled';
import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { useEffect, useRef, useState } from 'react';
import { Input } from 'Scenes/Game/SongSelection/Input';
import createPersistedState from 'use-persisted-state';
import WebRTCClient from './WebRTCClient';

interface Props {
    roomId: string;
}

const usePersistedName = createPersistedState<string>('remote_mic_name');

function Phone({ roomId }: Props) {
    const [name, setName] = usePersistedName('');
    const [currentFrequency, setCurrentFrequency] = useState(0);
    const [volume, setVolume] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // useEffect(() => {
    //     MicInput.startMonitoring();
    //     return MicInput.addListener((freqs, volumes) => {
    //         setCurrentFrequency(freqs[0]);
    //         setVolume(volumes[0]);
    //     });
    // }, []);

    return (
        <LayoutWithBackground>
            <Container>
                <h2>{currentFrequency}</h2>
                <h2>{volume}</h2>
                <Input focused={false} label="Name" value={name} onChange={setName} ref={inputRef} />
                <MenuButton onClick={() => WebRTCClient.connect(roomId, name)}>Connect</MenuButton>
            </Container>
        </LayoutWithBackground>
    );
}
export default Phone;

const Container = styled(MenuContainer)`
    margin: 0 auto;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
    height: 100vh;
    max-height: 800px;
`;
