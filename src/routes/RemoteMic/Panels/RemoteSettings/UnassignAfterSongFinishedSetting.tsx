import { Checkbox } from '~/modules/Elements/AKUI/Checkbox';
import { serverRpc } from '~/modules/RemoteMic/Network/Client';
import { useServerMutation } from '~/modules/RemoteMic/Network/Client/hooks/useServerMutation';
import { useServerQuery } from '~/modules/RemoteMic/Network/Client/hooks/useServerQuery';

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
