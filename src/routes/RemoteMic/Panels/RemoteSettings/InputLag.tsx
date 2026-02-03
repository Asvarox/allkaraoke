import { useEffect, useState } from 'react';
import { Menu } from '~/modules/Elements/AKUI/Menu';
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
      <Menu.SubHeader>Adjust game input lag</Menu.SubHeader>
      <NumericInput
        value={currentValue}
        onChange={changeValue}
        disabled={isLoading}
        unit="ms"
        data-test="game-input-lag"
      />
      <Menu.HelpText>If the sound is not synchronised with the lyrics, use this to compensate it.</Menu.HelpText>
    </>
  );
}

export default RemoteInputLag;
