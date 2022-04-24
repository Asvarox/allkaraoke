import { MenuButton, MenuContainer } from 'Elements/Menu';
import { navigate } from 'hooks/useHashLocation';
import useKeyboardNav from 'hooks/useKeyboardNav';
import GithubRibbon from 'Scenes/Welcome/GithubRibbon';
import styled from 'styled-components';
import { Link } from 'wouter';
import logo from './logo.gif';

function Welcome() {
    const { register } = useKeyboardNav();
    return (
        <>
            <GithubRibbon />
            <Container>
                <Logo src={logo} alt="Olkaraoke logo" />
                <MenuContainer>
                    <Link href="/game">
                        <MenuButton data-test="sing-a-song" {...register('sing a song', () => navigate('/game'))}>
                            Sing a song
                        </MenuButton>
                    </Link>
                    {false && (
                        <Link href="/select-input">
                            <MenuButton {...register('select input', () => navigate('/select-input'))}>
                                Setup Microphones
                            </MenuButton>
                        </Link>
                    )}
                    <Link href="/jukebox">
                        <MenuButton data-test="jukebox" {...register('jukebox', () => navigate('/jukebox'))}>
                            Jukebox
                        </MenuButton>
                    </Link>
                    {false && (
                        <Link href="/connect-phone">
                            <MenuButton {...register('connect phone', () => navigate('/connect-phone'))}>
                                Connect Phone
                            </MenuButton>
                        </Link>
                    )}
                    <Link href="/edit">
                        <MenuButton {...register('edit songs', () => navigate('/edit'))}>Edit songs</MenuButton>
                    </Link>
                    <Link href="/convert">
                        <MenuButton {...register('convert', () => navigate('/convert'))}>
                            Convert UltraStar .txt
                        </MenuButton>
                    </Link>
                </MenuContainer>
            </Container>
        </>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Logo = styled.img``;

export default Welcome;
