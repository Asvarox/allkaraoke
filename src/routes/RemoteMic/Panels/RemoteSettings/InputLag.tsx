import { Menu } from '~/modules/Elements/AKUI/Menu';
import { serverRpc } from '~/modules/RemoteMic/Network/Client';
import { useServerMutation } from '~/modules/RemoteMic/Network/Client/hooks/useServerMutation';
import { useServerQuery } from '~/modules/RemoteMic/Network/Client/hooks/useServerQuery';
import NumericInput from '~/routes/RemoteMic/Components/NumericInput';

function RemoteInputLag() {
  const {
    data: currentValue = 0,
    loading: queryLoading,
    refetch,
  } = useServerQuery(() => serverRpc.settings.getInputLag());
  const { mutate, loading: mutating } = useServerMutation(async (newValue: number) => {
    await serverRpc.settings.setInputLag(newValue);
    refetch();
  });

  return (
    <>
      <Menu.SubHeader>Adjust game input lag</Menu.SubHeader>
      <NumericInput
        value={currentValue}
        onChange={(value) => void mutate(value)}
        disabled={queryLoading || mutating}
        unit="ms"
        data-test="game-input-lag"
        info="If the sound is not synchronised with the lyrics, use this to compensate it."
      />
    </>
  );
}

export default RemoteInputLag;
