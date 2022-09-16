import styled from '@emotion/styled';
import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { navigate } from 'hooks/useHashLocation';
import useKeyboardNav from 'hooks/useKeyboardNav';
import GithubRibbon from 'Scenes/Welcome/GithubRibbon';
import { Link } from 'wouter';
import logo from './logo.gif';

function Welcome() {
    const { register } = useKeyboardNav();
    return (
        <LayoutWithBackground>
            <GithubRibbon />
            <Container>
                <Logo src={logo} alt="Olkaraoke logo" />
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
                </MenuContainer>
            </Container>
        </LayoutWithBackground>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Logo = styled.img``;

export default Welcome;
