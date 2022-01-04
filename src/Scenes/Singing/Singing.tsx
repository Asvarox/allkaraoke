import useWindowSize from './useWindowSize';
import { Song, SongPreview } from '../../interfaces';
import { useQuery } from 'react-query';
import Player from './Player';

interface Props {
    songPreview: SongPreview,
}

function Singing({ songPreview }: Props) {
    const song = useQuery<Song>(`song-${songPreview.file}`, () => fetch(`./songs/${songPreview.file}`).then(response => response.json()));
    const { width, height } = useWindowSize();

    if (!width || !height || !song.data) return <>Loading</>;

    return <Player song={song.data} width={width} height={height} autoplay />;
}

export default Singing;
