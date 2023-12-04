import styled from '@emotion/styled';
import { useBackground } from 'Elements/LayoutWithBackground';
import { MenuButton } from 'Elements/Menu';
import MenuWithLogo from 'Elements/MenuWithLogo';
import { typography } from 'Elements/cssMixins';
import { BackgroundMusicSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import FacebookLink from 'Scenes/Welcome/FacebookLink';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import useKeyboardNav from 'hooks/useKeyboardNav';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { MouseEventHandler } from 'react';
import { Link } from 'wouter';

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
        <Link href="game/" onClick={handleClick('game/')}>
          <MenuButton {...register('sing-a-song', () => navigate('game/'))}>Sing a song</MenuButton>
        </Link>
        <Link href="select-input" onClick={handleClick('select-input')}>
          <MenuButton {...register('select-input', () => navigate('select-input'))}>Setup Microphones</MenuButton>
        </Link>
        <Link href="settings" onClick={handleClick('settings')}>
          <MenuButton {...register('settings', () => navigate('settings'))}>Settings</MenuButton>
        </Link>
        <Link href="jukebox" onClick={handleClick('jukebox')}>
          <MenuButton {...register('jukebox', () => navigate('jukebox'))}>Jukebox</MenuButton>
        </Link>
        <Link href="manage-songs" onClick={handleClick('manage-songs')}>
          <MenuButton {...register('manage-songs', () => navigate('manage-songs'))}>Manage Songs</MenuButton>
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
