import { useEffect } from 'react';
import RemoteMicClient from '~/modules/RemoteMic/Network/Client';
import { useMySongList } from '~/routes/RemoteMic/Panels/RemoteSongList/useMySongList';

const useSendInitialSongList = (send: boolean) => {
  const { savedSongList } = useMySongList();
  useEffect(() => {
    if (send) {
      RemoteMicClient.sendMySongList({
        added: savedSongList,
      });
    }
  }, [send]);
};

export default useSendInitialSongList;
