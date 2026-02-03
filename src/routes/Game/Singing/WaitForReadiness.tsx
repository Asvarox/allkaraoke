import { CheckCircleOutline } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import Typography from '~/modules/Elements/AKUI/Primitives/Typography';
import Loader from '~/modules/Elements/Loader';
import events from '~/modules/GameEvents/GameEvents';
import { useEventEffect, useEventListenerSelector } from '~/modules/GameEvents/hooks';
import PlayersManager from '~/modules/Players/PlayersManager';
import { waitFinished, waitForReadinessMusic } from '~/modules/SoundManager';
import isE2E from '~/modules/utils/isE2E';
import sleep from '~/modules/utils/sleep';
import SinglePlayer from '~/routes/SingASong/SongSelection/Components/SongSettings/MicCheck/SinglePlayer';

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
        await waitForReadinessMusic.play(false);
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
    <div className="typography absolute inset-0 z-[1000] flex h-full w-full flex-col items-center justify-center gap-8 text-xl">
      {!areAllPlayersReady && (
        <Typography className="text-2xl">
          Waiting for all players to click <strong>&quot;Ready&quot;</strong>
        </Typography>
      )}
      <div className="flex flex-col gap-4 [view-transition-name:player-mic-check-container]">
        {playerStatuses.map(({ confirmed, name, player }, index) => (
          <div
            className="ph-no-capture flex items-center gap-5"
            key={index}
            data-test="player-confirm-status"
            data-name={name}
            data-confirmed={confirmed}>
            {!areAllPlayersReady && (
              <span className="h-12 w-12 text-2xl [&_svg]:h-12! [&_svg]:w-12! [&_svg]:stroke-black">
                {confirmed ? <CheckCircleOutline /> : <Loader color="info" size="auto" />}
              </span>
            )}{' '}
            <SinglePlayer player={player} />
          </div>
        ))}
      </div>
      {!areAllPlayersReady && (
        <Typography className="text-2xl">
          The song will start automatically in{' '}
          <strong>
            <CountUp end={0} start={AUTOSTART_TIMEOUT_S} duration={AUTOSTART_TIMEOUT_S} useEasing={false} />
          </strong>
        </Typography>
      )}
    </div>
  );
}

export default WaitForReadiness;
