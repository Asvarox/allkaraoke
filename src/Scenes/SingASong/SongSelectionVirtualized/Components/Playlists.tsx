import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { focusedStatic, typography } from 'Elements/cssMixins';
import { PlaylistEntry } from 'Scenes/SingASong/SongSelectionVirtualized/Hooks/usePlaylists';
import { useOnClickOutside } from 'hooks/onClickOutside';
import useKeyboard from 'hooks/useKeyboard';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface Props {
  selectedPlaylist: string | null;
  setSelectedPlaylist: Dispatch<SetStateAction<string | null>>;
  playlists: PlaylistEntry[];
  closePlaylist: (leavingKey?: 'left' | 'right') => void;
  active: boolean;
}

export default function Playlists({ active, closePlaylist, playlists, selectedPlaylist, setSelectedPlaylist }: Props) {
  const { register, focused, focusElement } = useKeyboardNav({
    enabled: active,
    additionalHelp: {
      // It's possible to leave the playlists with left/right
      vertical: undefined,
      'horizontal-vertical': null,
    },
  });

  const ref = useRef(null);
  useOnClickOutside(ref, () => {
    closePlaylist();
  });
  useKeyboard(
    {
      left: () => closePlaylist('left'),
      right: () => closePlaylist('right'),
    },
    active,
  );

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('playlist');
    if (param) {
      focusElement(`playlist-${param}`);
    }
  }, []);

  useEffect(() => {
    if (focused) {
      const playlist = playlists.find((list) => `playlist-${list.name}` === focused);
      if (playlist) {
        /// push query param to url containing playlist name
        const url = new URL(window.location.href);
        url.searchParams.set('playlist', playlist.name);
        window.history.replaceState(null, '', url.toString());
        setSelectedPlaylist(playlist.name);
      }
    }
  }, [focused, playlists]);

  return (
    <Container data-test="song-list-playlists" active={active} ref={ref}>
      {playlists.map(({ Wrapper, ...playlist }) => {
        const child = (
          <Playlist
            key={playlist.name}
            data-selected={`playlist-${playlist.name}` === focused}
            active={active}
            {...register(
              `playlist-${playlist.name}`,
              () => focusElement(`playlist-${playlist.name}`),
              undefined,
              playlist.name === selectedPlaylist,
            )}
            {...(!active ? { selected: `playlist-${playlist.name}` === focused } : {})}>
            {playlist.display ?? playlist.name}
          </Playlist>
        );

        return Wrapper ? (
          <Wrapper key={playlist.name} active={active} focused={`playlist-${playlist.name}` === focused}>
            {child}
          </Wrapper>
        ) : (
          child
        );
      })}
    </Container>
  );
}

const Container = styled.div<{ active: boolean }>`
  background: rgba(0, 0, 0, ${(props) => (props.active ? 0.75 : 0.5)});
  width: 100vh;
  height: var(--song-sidebar-weight);
  transform-origin: top right;
  transform: rotate(-90deg);
  position: absolute;
  z-index: 200;
  left: -100vh;
  top: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: row-reverse;
  gap: 0;

  h2 {
    ${typography};
    margin: 0;
  }
`;

const Playlist = styled(Button)<{ selected?: boolean; active: boolean }>`
  font-size: 2.3rem;
  justify-self: stretch;
  flex-grow: 1;
  ${(props) => !props.focused && props.active && `background-color: transparent;`};
  padding: 1.5rem 1rem;
  ${(props) => (props.selected ? focusedStatic : !props.active && `opacity: .75;`)}
`;
