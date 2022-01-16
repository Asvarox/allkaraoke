import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Link } from 'wouter';
import { SongPreview } from '../../interfaces';

interface Props {}

export default function SongList(props: Props) {
    const songList = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );

    if (!songList.data) return <>Loading</>;

    return (
        <Container>
            <h3>{songList.data.length} songs</h3>
            <ul>
                {songList.data.map((song) => (
                    <li key={song.file}>
                        <Link to={`/edit/${encodeURIComponent(song.file)}`}>
                            <a>
                                {song.artist} - {song.title}
                            </a>
                        </Link>
                    </li>
                ))}
            </ul>
        </Container>
    );
}

const Container = styled.div`
    margin: 0 auto;
    height: 100%;
    width: 1100px;
    background: white;
    padding: 20px;
`;
