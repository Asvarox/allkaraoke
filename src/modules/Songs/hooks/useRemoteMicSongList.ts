import remoteMicSongList from 'modules/Songs/RemoteMicSongList';
import { useEffect, useState } from 'react';

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
