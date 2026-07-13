import { useEffect } from 'react';
import { twc } from 'react-twc';
import { useUpdate } from 'react-use';
import styles from '~/modules/game-engine/drawing/styles';
import { useSubscription } from '~/modules/remote-mic/network/client/hooks/use-subscription';

interface Props {
  number: number | null;
}

export default function PlayerNumberCircle({ number, ...restProps }: Props) {
  const style = useSubscription('style') ?? 'regular';
  const forceUpdate = useUpdate();
  useEffect(() => {
    forceUpdate();
  }, [style, forceUpdate]);

  return (
    <PlayerColorCircle
      style={{
        background: number !== null ? styles.colors.players[number].perfect.fill : styles.colors.text.inactive,
      }}
      {...restProps}
    />
  );
}

const PlayerColorCircle = twc.div`inline-block aspect-square h-[1em] w-[1em] rounded-[1em]`;
