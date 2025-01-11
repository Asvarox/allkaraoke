import { SongGroup } from 'routes/SingASong/SongSelection/Hooks/useSongList';

export const getSongIdWithNew = (song: SongGroup['songs'][number], songGroup: SongGroup) => {
  return `${song.song.id}${songGroup.isNew ? '-new-group' : ''}`;
};
