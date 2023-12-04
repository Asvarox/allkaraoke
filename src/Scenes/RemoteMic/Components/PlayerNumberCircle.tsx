import styled from '@emotion/styled';
import gameEvents from 'GameEvents/GameEvents';
import { useEventListener } from 'GameEvents/hooks';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { useEffect } from 'react';
import { useUpdate } from 'react-use';

interface Props {
  number: number | null;
}

export default function PlayerNumberCircle({ number, ...restProps }: Props) {
  const [style] = useEventListener(gameEvents.remoteStyleChanged, true) ?? ['normal'];
  const forceUpdate = useUpdate();
  useEffect(() => {
    forceUpdate();
  }, [style]);

  return (
    <PlayerColorCircle
      style={{
        background: number !== null ? styles.colors.players[number].perfect.fill : styles.colors.text.inactive,
      }}
      {...restProps}
    />
  );
}

const PlayerColorCircle = styled.div`
  display: inline-block;
  width: 1em;
  height: 1em;
  aspect-ratio: 1;
  border-radius: 1em;
`;
