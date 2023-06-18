import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { useCallback, useEffect, useRef, useState } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { PlayerMicCheck } from 'Elements/VolumeIndicator';
import { useEventListenerSelector } from 'GameEvents/hooks';
import events from 'GameEvents/GameEvents';
import usePlayerMic from 'hooks/players/usePlayerMic';
import { Warning } from '@mui/icons-material';

export default function MicCheck() {
    useEffect(() => {
        InputManager.startMonitoring();
    }, []);

    const inputs = useEventListenerSelector(events.playerInputChanged, () => InputManager.getInputs());
    const isSetup = inputs.some((input) => input.inputSource !== 'Dummy');
    const isBuiltIn = inputs.some((input) => input.inputSource === 'Microphone');

    const measures = useRef<Array<[number, number]>>([]);
    const handleMeasure = useCallback((data: [number, number]) => {
        measures.current.push(data);
    }, []);

    usePlayerMic(0, 50, handleMeasure);

    const [noiseDetected, setNoiseDetected] = useState(false);
    useEffect(() => {
        const interval = setInterval(
            () => {
                const noDetection = measures.current.filter(([, freq]) => freq === 0);
                const detection = measures.current.filter(([, freq]) => freq > 0);
                const avgNoDetectionVolume =
                    noDetection.reduce((acc, [volume]) => acc + volume, 0) / (noDetection.length + 1);
                const avgDetectionVolume =
                    detection.reduce((acc, [volume]) => acc + volume, 0) / (detection.length + 1);

                // The logic is that if the singing measures and non-singing measures have similar volume, then there's
                // something playing in the background that is picked up as singing. If someone is singing into the mic
                // the non-singing measures are usually quiet compared to singing measures.
                const isNoisy =
                    detection.length > noDetection.length * 0.1 &&
                    avgDetectionVolume > 0.01 &&
                    avgNoDetectionVolume > 0.01 &&
                    avgDetectionVolume - avgNoDetectionVolume < avgNoDetectionVolume / 2;

                console.log(avgDetectionVolume, avgNoDetectionVolume);
                setNoiseDetected(isNoisy);
                measures.current.length = 0;
            },
            noiseDetected ? 5000 : 2500,
        );

        return () => clearInterval(interval);
    }, [noiseDetected]);

    return (
        <Container>
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
            <NoiseWarningContainer visible={noiseDetected}>
                <h2>
                    <strong>
                        <Warning />
                    </strong>{' '}
                    Noise detected
                </h2>
                <hr />
                <h4>
                    This might make singing inaccurate. Make sure your microphone doesn't pick up the music.{' '}
                    {isBuiltIn && (
                        <>
                            Alternatively, use your <strong>smartphone as a microphone</strong> instead.
                        </>
                    )}
                </h4>
            </NoiseWarningContainer>
        </Container>
    );
}

const NoiseWarningContainer = styled.div<{ visible: boolean }>`
    opacity: ${(props) => (props.visible ? 1 : 0)};
    transition: 300ms;
    background: rgba(0, 0, 0, 0.75);
    padding: 1rem;
    max-width: 50rem;
    position: relative;
    top: -1rem;
    left: -0.5rem;
`;

const Container = styled.div`
    display: flex;
    font-size: 3rem;
    ${typography};
    margin-bottom: 8.6rem;
    gap: 3.5rem;
`;

const MicChecksContainer = styled.div`
    gap: 1.25rem;
    display: flex;
    flex-direction: column;
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
