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
            <VolumeIndicator playerNumber={0}>
                <MicChecks>Player 1</MicChecks>
            </VolumeIndicator>
            <VolumeIndicator playerNumber={1}>
                <MicChecks>Player 2</MicChecks>
            </VolumeIndicator>
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

const MicChecks = styled.div`
    text-align: center;
    gap: 0.5em;
    font-size: 0.75em;
`;
