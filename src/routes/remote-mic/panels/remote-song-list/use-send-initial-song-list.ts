import { useEffect } from 'react';

import { serverRpc } from '~/modules/remote-mic/network/client';
import { useMySongList } from '~/routes/remote-mic/panels/remote-song-list/use-my-song-list';

const useSendInitialSongList = (send: boolean) => {
  const { savedSongList } = useMySongList();
  useEffect(() => {
    if (send) {
      void serverRpc.songs.sendMyList({ added: savedSongList });
    }
  }, [send, savedSongList]);
};

export default useSendInitialSongList;
