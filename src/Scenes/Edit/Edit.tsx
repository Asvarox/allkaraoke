import styled from '@emotion/styled';
import { Song } from 'interfaces';
import { useQuery } from 'react-query';
import { Link } from 'wouter';
import EditSong from './EditSong';

interface Props {
    file: string;
}

export default function Edit(props: Props) {
    const song = useQuery<Song>(`song-${props.file}-edit`, () =>
        fetch(`./songs/${props.file}`).then((response) => response.json()),
    );

    if (!song.data) return <>Loading</>;

    return (
        <Container>
            <div>
                <Link to="/edit">
                    <a>Return to the song list</a>
                </Link>
            </div>
            <EditSong song={song.data} />
        </Container>
    );
}

const Container = styled.div`
    margin: 0 auto;
    margin-top: 30px;
    width: 1440px;
    height: 100%;
    background: white;
`;
