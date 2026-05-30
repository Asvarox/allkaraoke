import { Menu } from '~/modules/elements/akui/menu';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { useServerMutation } from '~/modules/remote-mic/network/client/hooks/use-server-mutation';
import { useServerQuery } from '~/modules/remote-mic/network/client/hooks/use-server-query';
import NumericInput from '~/routes/remote-mic/components/numeric-input';

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
