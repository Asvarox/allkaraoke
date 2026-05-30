import { Checkbox } from '~/modules/elements/akui/checkbox';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { useServerMutation } from '~/modules/remote-mic/network/client/hooks/use-server-mutation';
import { useServerQuery } from '~/modules/remote-mic/network/client/hooks/use-server-query';

function UnassignAfterSongFinishedSetting() {
  const {
    data: currentValue = false,
    loading: queryLoading,
    refetch,
  } = useServerQuery(() => serverRpc.settings.getUnassignAfterSong());
  const { mutate, loading: mutating } = useServerMutation(async (newValue: boolean) => {
    await serverRpc.settings.setUnassignAfterSong(newValue);
    refetch();
  });

  return (
    <Checkbox
      disabled={queryLoading || mutating}
      checked={currentValue}
      onClick={() => void mutate(!currentValue)}
      size="small"
      info="Unassign players after they finish singing">
      Reset players
    </Checkbox>
  );
}

export default UnassignAfterSongFinishedSetting;
