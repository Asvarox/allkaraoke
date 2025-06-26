import { Checkbox } from 'modules/Elements/AKUI/Checkbox';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import { useEffect, useState } from 'react';

function UnassignAfterSongFinishedSetting() {
  const [currentValue, setCurrentValue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    RemoteMicClient.getUnassignPlayersAfterSongFinishedSetting()
      .then(({ state }) => setCurrentValue(state))
      .catch((e) => console.warn(e))
      .finally(() => setIsLoading(false));
  }, []);

  const changeValue = (newValue: boolean) => {
    setIsLoading(true);
    RemoteMicClient.setUnassignPlayersAfterSongFinishedSetting(newValue)
      .then(({ state }) => setCurrentValue(state))
      .catch((e) => console.warn(e))
      .finally(() => setIsLoading(false));
  };

  return (
    <Checkbox
      disabled={isLoading}
      checked={currentValue}
      onClick={() => changeValue(!currentValue)}
      size="small"
      info="Unassign players after they finish singing">
      Reset players
    </Checkbox>
  );
}

export default UnassignAfterSongFinishedSetting;
