import styled from '@emotion/styled';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useSong from 'modules/Songs/hooks/useSong';
import useBackgroundMusic from 'modules/hooks/useBackgroundMusic';
import useQueryParam from 'modules/hooks/useQueryParam';
import { Helmet } from 'react-helmet';
import Convert from 'routes/Convert/Convert';
import { Link } from 'wouter';

dayjs.extend(relativeTime);

export default function Edit() {
  const songId = useQueryParam('song');
  useBackgroundMusic(false);
  const song = useSong(songId ?? '');

  if (!song.data) return <>Loading</>;

  return (
    <Container>
      <Helmet>
        <title>Edit Song | AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <TopBar>
        <Link to="edit/list/">
          <a>Return to the song list</a>
        </Link>
        <span>
          Editing:{' '}
          <b>
            {song.data.artist} - {song.data.title}
          </b>
        </span>
        <abbr title={song.data.lastUpdate}>
          Last updated: <b>{song.data.lastUpdate ? dayjs(song.data.lastUpdate).fromNow() : '-'}</b>
        </abbr>
      </TopBar>
      <Convert song={song.data} />
    </Container>
  );
}

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Container = styled.div`
  margin: 30px auto 0 auto;
  width: 1260px;
  height: 100%;
  background: white;
`;
