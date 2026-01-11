import { useEffect, useState } from 'react';
import Typography from '~/modules/Elements/AKUI/Primitives/Typography';
import RemoteMicClient from '~/modules/RemoteMic/Network/Client';
import NumericInput from '~/routes/RemoteMic/Components/NumericInput';

function RemoteInputLag() {
  const [currentValue, setCurrentValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    RemoteMicClient.getGameInputLag()
      .then(({ value }) => setCurrentValue(value))
      .catch((e) => console.warn(e))
      .finally(() => setIsLoading(false));
  }, []);

  const changeValue = (newValue: number) => {
    setIsLoading(true);
    RemoteMicClient.setGameInputLag(newValue)
      .then(({ value }) => setCurrentValue(value))
      .catch((e) => console.warn(e))
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <h3>Adjust game input lag</h3>
      <NumericInput
        value={currentValue}
        onChange={changeValue}
        disabled={isLoading}
        unit="ms"
        data-test="game-input-lag"
      />
      <Typography className="text-sm">
        If the sound is not synchronised with the lyrics, use this to compensate it.
      </Typography>
    </>
  );
}

export default RemoteInputLag;
