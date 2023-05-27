import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { MenuButton } from 'Elements/Menu';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { Link } from 'wouter';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import { useBackground } from 'Elements/LayoutWithBackground';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { MouseEventHandler } from 'react';
import MenuWithLogo from 'Elements/MenuWithLogo';
import FacebookLink from 'Scenes/Welcome/FacebookLink';
import { BackgroundMusicSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

function Welcome() {
    const [backgroundMusicSelection] = useSettingValue(BackgroundMusicSetting);
    useBackground(true);

    const navigate = useSmoothNavigate();

    const handleClick: (url: string) => MouseEventHandler<HTMLAnchorElement> = (url) => (e) => {
        e.preventDefault();
        navigate(url);
    };

    useBackgroundMusic(/* true */ false);
    const { register } = useKeyboardNav();
    return (
        <MenuWithLogo>
            {backgroundMusicSelection !== 'Classic' && (
                <BackgroundMusicCredit>
                    <span>
                        Bpm data and release year provided by{' '}
                        <a target="_blank" href="https://getsongbpm.com/" rel="noreferrer">
                            GetSongBPM
                        </a>
                    </span>
                    <span>Song: Funk Cool Groove (Music Today 80)</span>
                    <span>• Composed & Produced by : Anwar Amr</span>
                    <span>
                        • Video Link:{' '}
                        <a href="https://youtu.be/FGzzBbYRjFY" target="_blank" rel="noreferrer">
                            https://youtu.be/FGzzBbYRjFY
                        </a>
                    </span>
                </BackgroundMusicCredit>
            )}
            <FacebookLink />
            <>
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
            </>
        </MenuWithLogo>
    );
}

const BackgroundMusicCredit = styled.div`
    ${typography};
    text-decoration: none;
    flex-direction: column;
    display: flex;
    font-size: 1rem;
    gap: 1.25rem;
    opacity: 0.85;
    position: absolute;
    bottom: 1rem;
    left: 1rem;

    view-transition-name: background-music-credit;
`;

export default Welcome;
