import { decodeSongList, SetlistEntity } from '~/modules/Songs/utils/setlists';
import storage from '~/modules/utils/storage';

const currentSetlist = storage.session.getItem<SetlistEntity | null>('currentSetlist');

const urlParams = new URLSearchParams(window.location.search);
const setlistParam = urlParams.get('setlist');
const setlist = setlistParam ? decodeSongList(setlistParam) : (currentSetlist ?? null);

if (setlist && !currentSetlist) {
  storage.session.setItem('currentSetlist', setlist);
}

export const useSetlist = () => {
  return {
    isSetlistInPlace: !!setlist?.songList,
    songList: setlist?.songList ?? null,
    isEditable: setlist?.isEditable ?? true,
  };
};
