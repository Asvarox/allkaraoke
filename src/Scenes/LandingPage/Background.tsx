import styled from '@emotion/styled';
import AnimatedTile from 'Scenes/LandingPage/AnimatedTile';
import isMobile from 'is-mobile';
import { useEffect, useMemo, useState } from 'react';
import isPrerendering from 'utils/isPrerendering';
import { randomInt } from 'utils/randomValue';
import songStats from './songStats.json';

const minTime = 10_000;
const maxTime = 20_000;

function RandomTile({ videoIds, index }: { videoIds: string[]; index: number }) {
  const [videoId, setVideoId] = useState(videoIds[index]);
  const [time, setTime] = useState(randomInt(isPrerendering ? 5_000 : 1_000, maxTime - minTime));

  useEffect(() => {
    const interval = setTimeout(() => {
      const index = randomInt(0, videoIds.length - 1);
      setVideoId(videoIds[index]);
      setTime(randomInt(minTime, maxTime));
    }, time);

    return () => clearInterval(interval);
  }, [videoIds, time]);

  return <AnimatedTile videoId={videoId} />;
}

function Background() {
  const isMobileDevice = useMemo(() => isMobile(), []);

  const cols = isMobileDevice ? 3 : 5;
  const rows = isMobileDevice ? 9 : 4;

  return (
    <Container cols={cols} rows={rows}>
      {new Array(cols * rows).fill(null).map((_, i) => (
        <RandomTile videoIds={songStats.videoIds} key={i} index={i} />
      ))}
    </Container>
  );
}

const Container = styled.div<{ cols: number; rows: number }>`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  filter: blur(2px) grayscale(90%);
  opacity: 0.25;
  transform: scale(1.05);
  z-index: -1;

  div {
    flex-basis: ${(props) => 100 / props.cols}%;
    height: ${(props) => 100 / props.rows}vh;
  }
`;

export default Background;
