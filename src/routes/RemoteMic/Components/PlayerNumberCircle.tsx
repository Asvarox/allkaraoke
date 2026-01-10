import styles from 'modules/GameEngine/Drawing/styles';
import gameEvents from 'modules/GameEvents/GameEvents';
import { useEventListener } from 'modules/GameEvents/hooks';
import { useEffect } from 'react';
import { twc } from 'react-twc';
import { useUpdate } from 'react-use';

interface Props {
  number: number | null;
}

export default function PlayerNumberCircle({ number, ...restProps }: Props) {
  const [style] = useEventListener(gameEvents.remoteStyleChanged, true) ?? ['regular'];
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

const PlayerColorCircle = twc.div`inline-block w-[1em] h-[1em] aspect-square rounded-[1em]`;
