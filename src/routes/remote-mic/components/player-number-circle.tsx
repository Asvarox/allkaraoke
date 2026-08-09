import { useEffect } from 'react';
import { useUpdate } from 'react-use';

import { PlayerColorDot } from '~/modules/elements/player-color-dot';
import { PlayerNumber } from '~/modules/players/player-number';
import { useSubscription } from '~/modules/remote-mic/network/client/hooks/use-subscription';

interface Props {
  number: PlayerNumber | null;
}

/**
 * The player dot on the phone. `PlayerColorDot` with the one thing only the remote mic needs on top
 * of it: the theme arrives over the wire, and `switchToTheme` swaps `styles.colors.players` in place
 * rather than through state, so nothing here would re-render on its own — hence the forced update.
 */
export default function PlayerNumberCircle({ number }: Props) {
  const style = useSubscription('style') ?? 'regular';
  const forceUpdate = useUpdate();
  useEffect(() => {
    forceUpdate();
  }, [style, forceUpdate]);

  return <PlayerColorDot number={number} />;
}
