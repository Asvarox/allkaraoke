import { SongGroup } from '~/routes/sing-a-song/song-selection/hooks/use-song-list';

export const getSongIdWithNew = (song: SongGroup['songs'][number], songGroup: SongGroup) => {
  return `${song.song.id}${songGroup.isNew ? '-new-group' : ''}`;
};
