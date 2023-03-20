import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { MenuButton } from 'Elements/Menu';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { Link } from 'wouter';
import getSongBpm from './logo_bpm.png';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import { useBackground } from 'Elements/LayoutWithBackground';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import MenuWithLogo from 'Elements/MenuWithLogo';
import { MouseEventHandler } from 'react';

function Welcome() {
    useBackground(true);

    const navigate = useSmoothNavigate();

    const handleClick: (url: string) => MouseEventHandler<HTMLAnchorElement> = (url) => (e) => {
        e.preventDefault();
        navigate(url);
    };

    useBackgroundMusic(/* true */ false);
    const { register } = useKeyboardNav();
    return (
        <>
            <BackgroundMusicCredit>
                <span>• Song: Funk Cool Groove (Music Today 80)</span>
                <span>• Composed & Produced by : Anwar Amr</span>
                <span>
                    • Video Link:{' '}
                    <a href="https://youtu.be/FGzzBbYRjFY" target="_blank" rel="noreferrer">
                        https://youtu.be/FGzzBbYRjFY
                    </a>
                </span>
            </BackgroundMusicCredit>
            <MenuWithLogo supportedBrowsers>
                <Link href="/game/" onClick={handleClick('/game/')}>
                    <MenuButton data-test="sing-a-song" {...register('sing a song', () => navigate('/game/'))}>
                        Sing a song
                    </MenuButton>
                </Link>
                <Link href="/select-input" onClick={handleClick('/select-input')}>
                    <MenuButton data-test="select-input" {...register('select input', () => navigate('/select-input'))}>
                        Setup Microphones
                    </MenuButton>
                </Link>
                <Link href="/settings" onClick={handleClick('/settings')}>
                    <MenuButton data-test="settings" {...register('settings', () => navigate('/settings'))}>
                        Settings
                    </MenuButton>
                </Link>
                <Link href="/jukebox" onClick={handleClick('/jukebox')}>
                    <MenuButton data-test="jukebox" {...register('jukebox', () => navigate('/jukebox'))}>
                        Jukebox
                    </MenuButton>
                </Link>
                <Link href="/manage-songs" onClick={handleClick('/manage-songs')}>
                    <MenuButton data-test="manage-songs" {...register('manage songs', () => navigate('/manage-songs'))}>
                        Manage Songs
                    </MenuButton>
                </Link>
                <GetSongBPM target="_blank" href="https://getsongbpm.com/">
                    Bpm data and release year provided by <img src={getSongBpm} />
                </GetSongBPM>
            </MenuWithLogo>
        </>
    );
}

const GetSongBPM = styled.a`
    ${typography};
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.1rem;
    img {
        width: 20%;
        height: 20%;
    }
`;
const BackgroundMusicCredit = styled.div`
    ${typography};
    text-decoration: none;
    flex-direction: column;
    display: flex;
    font-size: 1.5rem;
    gap: 1rem;
    opacity: 0.75;
    position: absolute;
    bottom: 0;
    left: 1rem;

    view-transition-name: background-music-credit;
`;

export default Welcome;
