import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { useEffect } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import VolumeIndicator from 'Scenes/Game/VolumeIndicator';

export default function MicCheck() {
    useEffect(() => {
        InputManager.startMonitoring();
    }, []);

    return (
        <MicChecksContainer>
            Microphone Check
            <VolumeIndicator playerNumber={0}>Player 1</VolumeIndicator>
            <VolumeIndicator playerNumber={1}>Player 2</VolumeIndicator>
        </MicChecksContainer>
    );
}

const MicChecksContainer = styled.div`
    font-size: 0.25em;
    gap: 0.5em;
    display: flex;
    flex-direction: column;
    ${typography};
    margin-bottom: 2.8em;
`;
