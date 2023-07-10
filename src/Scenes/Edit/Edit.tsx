import styled from '@emotion/styled';
import Convert from 'Scenes/Convert/Convert';
import useSong from 'Songs/hooks/useSong';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import { Link } from 'wouter';

interface Props {
    file: string;
}

export default function Edit(props: Props) {
    useBackgroundMusic(false);
    const song = useSong(props.file);

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
