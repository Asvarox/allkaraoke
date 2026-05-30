export const encodeSongList = (songList: number[], isEditable: boolean) => {
  return (isEditable ? '1' : '0') + songList.map((song) => song.toString(36).padStart(3, '0')).join('');
};

export interface SetlistEntity {
  songList: number[] | null;
  isEditable: boolean;
}

export const decodeSongList = ([editableMarked, ...encodedStringArray]: string): SetlistEntity => {
  const isEditable = editableMarked === '1';
  const songList = [];
  const encodedString = encodedStringArray.join('');
  for (let i = 0; i < encodedString.length; i += 3) {
    const song = parseInt(encodedString.slice(i, i + 3), 36);
    if (!isNaN(song)) {
      songList.push(song);
    }
  }
  return { isEditable, songList };
};
