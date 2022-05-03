import { SongPreview } from 'interfaces';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Link } from 'wouter';

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
                            <LinkView>
                                {song.artist} - {song.title}
                                <Metadata>
                                    [{song.language ?? 'MISSING LANGUAGE'}] [{song.year ?? 'MISSING YEAR'}]
                                </Metadata>
                            </LinkView>
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

const Metadata = styled.span`
    color: grey;
    font-size: 12px;
    float: right;
    padding-right: 300px;
`;

const LinkView = styled.a`
    display: block;
    width: 100%;
    margin-top: 10px;
    border-bottom: 1px dotted grey;
`;
