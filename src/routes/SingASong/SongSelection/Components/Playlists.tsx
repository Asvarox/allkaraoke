import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';
import { Button } from '~/modules/Elements/Button';
import { focusedStatic, typography } from '~/modules/Elements/cssMixins';
import { useOnClickOutside } from '~/modules/hooks/onClickOutside';
import useKeyboard from '~/modules/hooks/useKeyboard';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import { PlaylistEntry } from '~/routes/SingASong/SongSelection/Hooks/usePlaylists';

interface Props {
  selectedPlaylist: string | null;
  setSelectedPlaylist: (name: string) => void;
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

  const ref = useRef<HTMLDivElement>(null);
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
    focusElement(`playlist-${selectedPlaylist}`);
  }, [selectedPlaylist]);

  useEffect(() => {
    if (focused) {
      const playlist = playlists.find((list) => `playlist-${list.name}` === focused);
      if (playlist) {
        setSelectedPlaylist(playlist.name);
      }
    }
  }, [focused, playlists]);

  return (
    <Container data-test="song-list-playlists" active={active} ref={ref}>
      {playlists.map(({ Wrapper, ...playlist }) => {
        const child = (
          <Playlist
            className="rounded-none shadow-none"
            key={playlist.name}
            data-selected={`playlist-${playlist.name}` === focused}
            data-active={active}
            {...register(
              `playlist-${playlist.name}`,
              () => focusElement(`playlist-${playlist.name}`),
              undefined,
              playlist.name === selectedPlaylist,
            )}>
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

const Playlist = styled(Button)`
  font-size: 1.5rem;
  justify-self: stretch;
  flex-grow: 1;
  &[data-focused='false'][data-active='true'] {
    background-color: transparent;
  }
  &[data-selected='true'] {
    ${focusedStatic};
  }
  &[data-selected='false'][data-active='false'] {
    opacity: 0.75;
  }
  padding: 1rem 0.75rem;
`;
