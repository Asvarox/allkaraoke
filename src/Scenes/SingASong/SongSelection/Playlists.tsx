import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { typography } from 'Elements/cssMixins';
import { useLanguageList } from 'Scenes/ExcludeLanguages/ExcludeLanguagesView';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { AppliedFilters } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import dayjs from 'dayjs';
import useKeyboard from 'hooks/useKeyboard';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { SongPreview } from 'interfaces';
import { useEffect, useMemo } from 'react';

interface PlaylistEntry {
  name: string;
  filters: AppliedFilters;
}

const usePlaylists = (songs: SongPreview[]): PlaylistEntry[] => {
  const songLanguages = useLanguageList(songs);
  return useMemo(
    () =>
      [
        { name: 'All', filters: {} },
        { name: songLanguages[0].name, filters: { language: songLanguages[0].name } } as PlaylistEntry,
        songLanguages[1] ? { name: songLanguages[1].name, filters: { language: songLanguages[1].name } } : null,
        { name: 'Classics', filters: { yearBefore: 1995 } },
        { name: 'Modern', filters: { yearAfter: 1995 } },
        { name: 'Duets', filters: { duet: true } },
        { name: 'New', filters: { updatedAfter: dayjs().subtract(31, 'days').toISOString() } },
      ].filter((playlist): playlist is PlaylistEntry => playlist !== null),
    [songLanguages],
  );
};

interface Props {
  prefilteredList: SongPreview[];
  setFilters: (filters: AppliedFilters) => void;
  closePlaylist: (leavingKey: 'left' | 'right') => void;
  active: boolean;
}

export default function Playlists({ setFilters, active, closePlaylist, prefilteredList }: Props) {
  const playlists = usePlaylists(prefilteredList);

  const { register, focused, focusElement } = useKeyboardNav({
    enabled: active,
    additionalHelp: {
      // It's possible to leave the playlists with left/right
      vertical: undefined,
      'horizontal-vertical': null,
    },
  });

  useEffect(() => {
    if (focused) {
      const playlist = playlists.find((list) => `playlist-${list.name}` === focused);
      playlist && setFilters(playlist.filters);
    }
  }, [focused, playlists]);

  useKeyboard(
    {
      left: () => closePlaylist('left'),
      right: () => closePlaylist('right'),
    },
    active,
  );

  return (
    <Container data-test="song-list-playlists" active={active}>
      {playlists.map((playlist) => (
        <Playlist
          key={playlist.name}
          active={active}
          {...register(`playlist-${playlist.name}`, () => focusElement(`playlist-${playlist.name}`))}
          {...(!active ? { selected: `playlist-${playlist.name}` === focused } : {})}>
          {playlist.name}
        </Playlist>
      ))}
    </Container>
  );
}

const Container = styled.div<{ active: boolean }>`
  background: rgba(0, 0, 0, ${(props) => (props.active ? 0.75 : 0.5)});
  width: 100vh;
  transform-origin: top right;
  transform: rotate(-90deg);
  position: absolute;
  left: -100vh;
  top: 0;
  font-size: 3.6rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: row-reverse;

  h2 {
    ${typography};
    margin: 0;
  }
`;

const Playlist = styled(Button)<{ selected?: boolean; active: boolean }>`
  font-size: 3rem;
  flex: 1;
  ${(props) => !props.focused && props.active && `background-color: transparent;`};
  padding: 1.5rem;
  ${(props) =>
    props.selected
      ? `box-shadow: inset 0px 0px 0px 4px ${styles.colors.text.active};`
      : !props.active && `opacity: .5;`}
`;
