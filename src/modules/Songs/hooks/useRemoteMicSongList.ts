import { useEffect, useState } from 'react';
import remoteMicSongList from '~/modules/Songs/RemoteMicSongList';

export default function useRemoteMicSongList() {
  const [list, setList] = useState<string[]>(() => remoteMicSongList.getSongList());

  useEffect(() => {
    remoteMicSongList.addListener(setList);

    return () => {
      remoteMicSongList.removeListener(setList);
    };
  }, []);

  return list;
}
