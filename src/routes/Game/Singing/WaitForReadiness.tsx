import styled from '@emotion/styled';
import { CheckCircleOutline } from '@mui/icons-material';
import Loader from 'modules/Elements/Loader';
import { typography } from 'modules/Elements/cssMixins';
import events from 'modules/GameEvents/GameEvents';
import { useEventEffect, useEventListenerSelector } from 'modules/GameEvents/hooks';
import PlayersManager from 'modules/Players/PlayersManager';
import { waitFinished, waitForReadinessMusic } from 'modules/SoundManager';
import isE2E from 'modules/utils/isE2E';
import sleep from 'modules/utils/sleep';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import SinglePlayer from 'routes/SingASong/SongSelection/Components/SongSettings/MicCheck/SinglePlayer';

interface Props {
  onFinish: () => void;
}

const AUTOSTART_TIMEOUT_S = 15;

function WaitForReadiness({ onFinish }: Props) {
  const [areAllPlayersReady, setAreAllPlayersReady] = useState(false);

  const [confirmedPlayers, setConfirmedPlayers] = useState<string[]>([]);
  useEventEffect(events.readinessConfirmed, (deviceId) => {
    setConfirmedPlayers((current) => [...current, deviceId]);
  });

  const players = useEventListenerSelector([events.inputListChanged, events.readinessConfirmed], () => {
    return PlayersManager.getPlayers().map((player) => [player.input.deviceId!, player.getName(), player] as const);
  });

  useEffect(() => {
    (async () => {
      // can't use `areAllPlayersReady` as it would need to be specified as useEffect dependency
      let allInputsReady = false;
      const inputsReady = PlayersManager.requestReadiness().then(() => {
        allInputsReady = true;
        setAreAllPlayersReady(true);
      });
      const minTimeElapsed = sleep(isE2E() ? 250 : 1_500);
      const maxTimeElapsed = sleep(AUTOSTART_TIMEOUT_S * 1_000);

      // Only start the music if waiting for readiness takes some time
      await sleep(250);
      if (!allInputsReady) {
        await waitForReadinessMusic.play();
      }

      await Promise.race([Promise.all([inputsReady, minTimeElapsed]), maxTimeElapsed]);
      if (waitForReadinessMusic.playing()) waitFinished.play();
      await sleep(500);
      waitForReadinessMusic.stop();
      await sleep(1000);
      onFinish();
    })();
  }, []);

  const playerStatuses = players.map(([deviceId, name, player]) => ({
    confirmed: confirmedPlayers.includes(deviceId),
    name,
    player: player,
  }));

  return (
    <>
      <WaitingForReady>
        {!areAllPlayersReady && (
          <span>
            Waiting for all players to click <strong>&quot;Ready&quot;</strong>
          </span>
        )}
        <PlayerList>
          {playerStatuses.map(({ confirmed, name, player }, index) => (
            <PlayerEntry
              className="ph-no-capture"
              key={index}
              data-test="player-confirm-status"
              data-name={name}
              data-confirmed={confirmed}>
              {!areAllPlayersReady && (
                <ConfirmStatus>{confirmed ? <CheckCircleOutline /> : <Loader color="info" size="1em" />}</ConfirmStatus>
              )}{' '}
              <SinglePlayer player={player} />
            </PlayerEntry>
          ))}
        </PlayerList>
        {!areAllPlayersReady && (
          <TimeoutMessage>
            The song will start automatically in{' '}
            <strong>
              <CountUp end={0} start={AUTOSTART_TIMEOUT_S} duration={AUTOSTART_TIMEOUT_S} useEasing={false} />
            </strong>
          </TimeoutMessage>
        )}
      </WaitingForReady>
    </>
  );
}

const WaitingForReady = styled.div`
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: absolute;
  width: 100%;
  height: 100%;
  gap: 5rem;

  font-size: 5rem;
  ${typography};
`;

const TimeoutMessage = styled.span`
  font-size: 5rem;
`;

const PlayerList = styled.div`
  //margin-top: 5rem;
  display: flex;
  flex-direction: column;
  gap: 5rem;
  width: 50rem;
  view-transition-name: player-mic-check-container;
`;

const PlayerEntry = styled.div`
  display: flex;
  align-items: center;
  //justify-content: center;
  gap: 2rem;
  transform: scale(1.5);
`;

const ConfirmStatus = styled.span`
  svg {
    width: 5rem;
    height: 5rem;
    stroke: black;
  }
`;

export default WaitForReadiness;
