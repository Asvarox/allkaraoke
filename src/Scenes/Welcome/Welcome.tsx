import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { navigate } from 'hooks/useHashLocation';
import useKeyboardNav from 'hooks/useKeyboardNav';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import GithubRibbon from 'Scenes/Welcome/GithubRibbon';
import { Link } from 'wouter';
import logo from './logo.gif';
import getSongBpm from './logo_bpm.png';

function Welcome() {
    const { register } = useKeyboardNav();
    return (
        <LayoutWithBackground>
            <GithubRibbon />
            <Container>
                <Logo src={logo} alt="Olkaraoke logo" />
                {
                    // @ts-expect-error
                    !window.chrome && (
                        <RecommendChrome>
                            <h2>
                                This game works best in <strong>Google Chrome</strong> (and Chromium based browsers).
                            </h2>
                            It will not likely work properly on other browsers (like the one you use right now if you
                            see this message).
                        </RecommendChrome>
                    )
                }
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
                    <Link href="/edit">
                        <MenuButton data-test="edit-songs" {...register('edit songs', () => navigate('/edit'))}>
                            Edit songs
                        </MenuButton>
                    </Link>
                    <Link href="/convert">
                        <MenuButton data-test="convert-song" {...register('convert', () => navigate('/convert'))}>
                            Convert UltraStar .txt
                        </MenuButton>
                    </Link>
                    <GetSongBPM target="_blank" href="https://getsongbpm.com/">
                        Bpm data and release year provided by <img src={getSongBpm} />
                    </GetSongBPM>
                </MenuContainer>
            </Container>
        </LayoutWithBackground>
    );
}

const RecommendChrome = styled.div`
    width: 750px;
    ${typography};

    strong {
        color: ${styles.colors.text.active};
    }
`;

const GetSongBPM = styled.a`
    ${typography};
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    img {
        width: 20%;
        height: 20%;
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Logo = styled.img``;

export default Welcome;
