import styled from '@emotion/styled';
import { addDays, isAfter } from 'date-fns';
import { typography } from 'Elements/cssMixins';
import { SongPreview } from 'interfaces';
import { useSongStats } from 'Songs/stats/hooks';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';

export const SongCardContainer = styled.div`
    font-size: 4.5rem;

    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: column;
    box-sizing: border-box;
`;

export const SongCardBackground = styled.div<{ video: string; focused: boolean }>`
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-position: center center;
    // background-size: ${(props) => (props.focused ? 150.5 : 180)}%;
    background-size: ${(props) => (props.focused ? 100 : 110)}%;
    ${(props) => (props.focused ? '' : 'filter: grayscale(90%);')}

    opacity: ${(props) => (props.focused ? 1 : 0.8)};

    border-radius: 0.5rem;
    transition: 300ms;
`;

export const SongCard = styled(SongCardContainer)`
    cursor: pointer;
`;

export const SongListEntryDetails = styled.span<{ active?: boolean }>`
    background: rgba(0, 0, 0, 0.7);

    width: auto;
    display: inline-block;
    padding: 0.5rem;
    ${typography};

    text-align: right;
    font-size: ${({ active }) => (active ? '6rem' : '2.7rem')};
`;

export const SongListEntryDetailsArtist = styled(SongListEntryDetails)`
    color: ${styles.colors.text.active};
`;

export const SongListEntryDetailsTitle = styled(SongListEntryDetails)`
    margin-top: ${(props) => (props.active ? '1.5rem' : '0.5rem')};
    color: white;
`;

export const SongCardStatsIndicator = ({ song }: { song: SongPreview }) => {
    const stats = useSongStats(song);
    const lastPlayed = stats?.scores?.at(-1)?.date ?? false;

    const playedToday = lastPlayed && isAfter(new Date(lastPlayed), addDays(new Date(), -1));

    return stats?.plays ? (
        <SongStatIndicator data-test="song-stat-indicator">
            {playedToday ? 'Played today' : stats.plays}
        </SongStatIndicator>
    ) : null;
};

const SongStatIndicator = styled.div`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    //min-width: 1rem;
    padding: 0 1rem;
    height: 2rem;
    border-radius: 5rem;
    color: white;
    background: rgba(0, 0, 0, 0.75);
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
`;
