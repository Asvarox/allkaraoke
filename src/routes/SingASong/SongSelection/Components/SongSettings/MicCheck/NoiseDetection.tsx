import styled from '@emotion/styled';
import { Warning } from '@mui/icons-material';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import events from '~/modules/GameEvents/GameEvents';
import { useEventListenerSelector } from '~/modules/GameEvents/hooks';
import PlayersManager from '~/modules/Players/PlayersManager';
import { usePlayerMicData } from '~/modules/hooks/players/usePlayerMic';

export default memo(function NoiseDetection() {
  const inputs = useEventListenerSelector(events.playerInputChanged, () => PlayersManager.getInputs());
  const isBuiltIn = inputs.some((input) => input.source === 'Microphone');

  const measures = useRef<Array<[number, number]>>([]);
  const handleMeasure = useCallback((data: [number, number]) => {
    measures.current.push(data);
  }, []);

  usePlayerMicData(0, handleMeasure, true, 50);

  const [noiseDetected, setNoiseDetected] = useState(false);
  useEffect(() => {
    const interval = setInterval(
      () => {
        const noDetection = measures.current.filter(([, freq]) => freq === 0);
        const detection = measures.current.filter(([, freq]) => freq > 0);
        const avgNoDetectionVolume = noDetection.reduce((acc, [volume]) => acc + volume, 0) / (noDetection.length + 1);
        const avgDetectionVolume = detection.reduce((acc, [volume]) => acc + volume, 0) / (detection.length + 1);

        // The logic is that if the singing measures and non-singing measures have similar volume, then there's
        // something playing in the background that is picked up as singing. If someone is singing into the mic
        // the non-singing measures are usually quiet compared to singing measures.
        const isNoisy =
          detection.length > noDetection.length * 0.1 &&
          avgDetectionVolume > 0.01 &&
          avgNoDetectionVolume > 0.01 &&
          avgDetectionVolume - avgNoDetectionVolume < avgNoDetectionVolume / 2;

        setNoiseDetected(isNoisy);
        measures.current.length = 0;
      },
      noiseDetected ? 5000 : 2500,
    );

    return () => clearInterval(interval);
  }, [noiseDetected]);

  return (
    <NoiseWarningContainer visible={noiseDetected}>
      <div className="flex items-center gap-2 text-lg">
        <Warning className="text-active" />
        Noise detected
      </div>
      <hr />
      <div className="text-md">
        This might make singing inaccurate. Make sure your microphone doesn&#39;t pick up the music.{' '}
        {isBuiltIn && (
          <>
            Alternatively, use your <strong>smartphone as a microphone</strong> instead.
          </>
        )}
      </div>
    </NoiseWarningContainer>
  );
});

const NoiseWarningContainer = styled.div<{ visible: boolean }>`
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: 300ms;
  background: rgba(0, 0, 0, 0.75);
  padding: 1rem;
  max-width: 40rem;
  position: relative;
  top: -1rem;
  left: -0.5rem;
`;
