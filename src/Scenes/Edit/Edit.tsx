import styled from '@emotion/styled';
import { Song } from 'interfaces';
import { useQuery } from 'react-query';
import Convert from 'Scenes/Convert/Convert';
import { Link } from 'wouter';

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
