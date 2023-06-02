import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { useEffect } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { PlayerMicCheck } from 'Elements/VolumeIndicator';
import { useEventListenerSelector } from 'GameEvents/hooks';
import events from 'GameEvents/GameEvents';

export default function MicCheck() {
    useEffect(() => {
        InputManager.startMonitoring();
    }, []);

    const isSetup = useEventListenerSelector(events.playerInputChanged, () => {
        const selected = InputManager.getInputs();

        return selected.some((input) => input.inputSource !== 'Dummy');
    });

    return (
        <MicChecksContainer>
            Microphone Check
            <Indicator>
                {isSetup ? (
                    <>
                        Player 1<PlayerMicCheck playerNumber={0} />
                    </>
                ) : (
                    'Mic not setup'
                )}
            </Indicator>
            {isSetup ? (
                <Indicator>
                    Player 2<PlayerMicCheck playerNumber={1} />
                </Indicator>
            ) : (
                <>
                    <h4>Singing will be emulated</h4>
                    <h5>You can setup in the Next step</h5>
                </>
            )}
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
    align-items: center;
`;

const Indicator = styled.div`
    position: relative;
    border: 0.1rem solid white;
    padding: 1rem 3rem;
    background: black;
    width: 80%;

    text-align: center;
    gap: 1.25rem;
    font-size: 2.3rem;
    color: white;
`;
