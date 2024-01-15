import styled from '@emotion/styled';
import Convert from 'Scenes/Convert/Convert';
import useSong from 'Songs/hooks/useSong';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import useQueryParam from 'hooks/useQueryParam';
import { Link } from 'wouter';

export default function Edit() {
  const songId = useQueryParam('song');
  useBackgroundMusic(false);
  const song = useSong(songId ?? '');

  if (!song.data) return <>Loading</>;

  return (
    <Container>
      <div>
        <Link to="edit/list">
          <a>Return to the song list</a>
        </Link>
      </div>
      <Convert song={song.data} />
    </Container>
  );
}

const Container = styled.div`
  margin: 30px auto 0 auto;
  width: 1260px;
  height: 100%;
  background: white;
`;
