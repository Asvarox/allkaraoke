import { SongGroup } from '~/routes/SingASong/SongSelectionV2/Hooks/useSongList';

export const getSongIdWithNew = (song: SongGroup['songs'][number], songGroup: SongGroup) => {
  return `${song.song.id}${songGroup.isNew ? '-new-group' : ''}`;
};
