import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { useEffect } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { PlayerMicCheck } from 'Elements/VolumeIndicator';

export default function MicCheck() {
    useEffect(() => {
        InputManager.startMonitoring();
    }, []);

    return (
        <MicChecksContainer>
            Microphone Check
            <Indicator>
                Player 1<PlayerMicCheck playerNumber={0} />
            </Indicator>
            <Indicator>
                Player 2<PlayerMicCheck playerNumber={1} />
            </Indicator>
        </MicChecksContainer>
    );
}

const MicChecksContainer = styled.div`
    font-size: 3rem;
    gap: 1.25rem;
    display: flex;
    flex-direction: column;
    ${typography};
    margin-bottom: 8.6rem;
`;

const Indicator = styled.div`
    position: relative;
    border: 0.1rem solid white;
    padding: 1rem 3rem;
    background: black;

    text-align: center;
    gap: 1.25rem;
    font-size: 2.3rem;
    color: white;
`;
