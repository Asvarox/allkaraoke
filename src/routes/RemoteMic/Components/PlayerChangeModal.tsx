import { Menu } from 'modules/Elements/AKUI/Menu';
import { backgroundTheme } from 'modules/Elements/LayoutWithBackground';
import styles from 'modules/GameEngine/Drawing/styles';
import { default as events, default as gameEvents } from 'modules/GameEvents/GameEvents';
import { useEventListener } from 'modules/GameEvents/hooks';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import React, { useEffect } from 'react';

interface Props {
  id: string;
  playerNumber: 0 | 1 | 2 | 3 | null;
  onModalClose: () => void;
  header?: React.ReactNode;
}

const colorNames: Record<backgroundTheme, string[]> = {
  regular: ['Blue', 'Red', 'Green', 'Yellow'],
  christmas: ['Green', 'Red', 'Blue', 'Gold'],
  eurovision: ['Blue', 'Violet', 'Yellow', 'Pink'],
  halloween: ['Orange', 'Violet', 'Red', 'Green'],
};

export default function PlayerChangeModal({ playerNumber, id, onModalClose, header }: Props) {
  useEffect(() => {
    RemoteMicClient.subscribe('remote-mics');

    return () => {
      RemoteMicClient.unsubscribe('remote-mics');
    };
  }, []);

  const [list] = useEventListener(events.remoteMicListUpdated) ?? [[]];
  const [style] = useEventListener(gameEvents.remoteStyleChanged, true) ?? ['regular'];
  const selectPlayer = (player: 0 | 1 | 2 | 3 | null) => {
    RemoteMicClient.requestPlayerChange(id, player);
    onModalClose();
  };

  const joined = playerNumber !== null;

  return (
    <Menu>
      {header && <h2>{header}</h2>}
      {([0, 1, 2, 3] as const).map((number) => {
        const occupant = list.find((mic) => mic.number === number);
        const isOwn = number === playerNumber;

        return (
          <Menu.Button
            key={number}
            size="small"
            data-test={`change-to-player-${number}`}
            onClick={() => selectPlayer(number)}
            disabled={isOwn}
            className="gap-2"
            style={{ color: styles.colors.players[number].perfect.fill }}>
            {colorNames[style][number]}
            {isOwn || occupant ? (
              <span className="text-sm text-gray-300" data-test="mic-occupant">
                {' '}
                ({isOwn ? 'You' : occupant?.name})
              </span>
            ) : (
              ''
            )}
          </Menu.Button>
        );
      })}
      <Menu.Button size="small" onClick={() => selectPlayer(null)} disabled={!joined} data-test="change-to-unset">
        Unassign
      </Menu.Button>
      <hr />
      <Menu.Button size="small" onClick={() => RemoteMicClient.removePlayer(id)} data-test="remove-player">
        Remove
      </Menu.Button>
      <Menu.Button onClick={onModalClose} size="small">
        Close
      </Menu.Button>
    </Menu>
  );
}
