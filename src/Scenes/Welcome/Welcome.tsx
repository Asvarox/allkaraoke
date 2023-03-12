import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import useKeyboardNav from 'hooks/useKeyboardNav';
import GithubRibbon from 'Scenes/Welcome/GithubRibbon';
import { Link, useLocation } from 'wouter';
import getSongBpm from './logo_bpm.png';
import Logo from 'Elements/Logo';
import RecommendedBrowsers from 'Elements/RecommendedBrowsers';
import useBackgroundMusic from 'hooks/useBackgroundMusic';

function Welcome() {
    const [, navigate] = useLocation();
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
            <LayoutWithBackground>
                <GithubRibbon />
                <Container>
                    <Logo />
                    <RecommendedBrowsers />
                    <MenuContainer>
                        <Link href="/game">
                            <MenuButton data-test="sing-a-song" {...register('sing a song', () => navigate('/game'))}>
                                Sing a song
                            </MenuButton>
                        </Link>
                        <Link href="/select-input">
                            <MenuButton
                                data-test="select-input"
                                {...register('select input', () => navigate('/select-input'))}>
                                Setup Microphones
                            </MenuButton>
                        </Link>
                        <Link href="/settings">
                            <MenuButton data-test="settings" {...register('settings', () => navigate('/settings'))}>
                                Settings
                            </MenuButton>
                        </Link>
                        <Link href="/jukebox">
                            <MenuButton data-test="jukebox" {...register('jukebox', () => navigate('/jukebox'))}>
                                Jukebox
                            </MenuButton>
                        </Link>
                        <Link href="/manage-songs">
                            <MenuButton
                                data-test="manage-songs"
                                {...register('manage songs', () => navigate('/manage-songs'))}>
                                Manage Songs
                            </MenuButton>
                        </Link>
                        <GetSongBPM target="_blank" href="https://getsongbpm.com/">
                            Bpm data and release year provided by <img src={getSongBpm} />
                        </GetSongBPM>
                    </MenuContainer>
                </Container>
            </LayoutWithBackground>
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
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export default Welcome;
