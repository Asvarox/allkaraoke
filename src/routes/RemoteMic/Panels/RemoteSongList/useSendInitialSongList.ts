import { useEffect } from 'react';
import { serverRpc } from '~/modules/RemoteMic/Network/Client';
import { useMySongList } from '~/routes/RemoteMic/Panels/RemoteSongList/useMySongList';

const useSendInitialSongList = (send: boolean) => {
  const { savedSongList } = useMySongList();
  useEffect(() => {
    if (send) {
      void serverRpc.songs.sendMyList({ added: savedSongList });
    }
  }, [send]);
};

export default useSendInitialSongList;
