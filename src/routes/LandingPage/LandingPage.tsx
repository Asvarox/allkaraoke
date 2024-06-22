import styled from '@emotion/styled';
import { LinkButton } from 'modules/Elements/Button';
import { useBackground } from 'modules/Elements/LayoutWithBackground';
import Logo from 'modules/Elements/Logo';
import { DesktopOnly, MobileOnly } from 'modules/Elements/RWD';
import SmoothLink from 'modules/Elements/SmoothLink';
import { focusable, landscapeMQ, mobileMQ, typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import { FeatureFlags } from 'modules/utils/featureFlags';
import { useFeatureFlagVariantKey } from 'posthog-js/react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHotkeys } from 'react-hotkeys-hook';
import LayoutGame from 'routes/LayoutGame';
import { MicSetupPreferenceSetting, useSettingValue } from 'routes/Settings/SettingsState';
import GithubRibbon from 'routes/Welcome/GithubRibbon';
import Typewriter from 'typewriter-effect';
import LogoIcon from './LogoIcon';
import screenshot1 from './screenshot1.webp';
import screenshot2 from './screenshot2.webp';
import screenshot3 from './screenshot3.webp';
import songStats from './songStats.json';
export const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

function LandingPage() {
  const [setupPreference] = useSettingValue(MicSetupPreferenceSetting);
  const navigate = useSmoothNavigate();
  const newScreenshot = useFeatureFlagVariantKey(FeatureFlags.Shrek);

  useBackground(true);

  const nextPage = setupPreference === null ? 'quick-setup/' : 'menu/';

  useHotkeys(
    'enter',
    () => {
      navigate(nextPage);
    },
    [nextPage],
  );

  const [showTypewriter, setShowTypewriter] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowTypewriter(true);
    }, 4_000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <LayoutGame toolbar={false}>
      <Helmet>
        <title>AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <GithubRibbon />
      <Container>
        <DesktopOnly>
          <LogoContainer>
            <LogoIcon />
            <Logo />
          </LogoContainer>
        </DesktopOnly>
        <DesktopOnly>
          <SmoothLink to={nextPage}>
            <PlayButton data-test="enter-the-game" focused as="a">
              Enter the game
            </PlayButton>
          </SmoothLink>
        </DesktopOnly>
        <Stats>
          <StatSegment>
            <StatsDescription>
              <strong>AllKaraoke</strong> is a free online karaoke game inspired by PlayStation's{' '}
              <strong>SingStar</strong>. Sing along to your favorite songs and compete with your friends, all through
              the browser! Updated almost weekly with new songs and features.
            </StatsDescription>
            <hr />
            <StatText>
              ▸ <strong>{formatter.format(songStats.songs)}</strong> songs in{' '}
              <strong>{songStats.languages.length}</strong> languages
              <StatSubText>
                Artists such as{' '}
                <strong>
                  {showTypewriter ? (
                    <Typewriter
                      options={{
                        strings: songStats.artists,
                        autoStart: true,
                        loop: true,
                        delay: 100,
                      }}
                    />
                  ) : (
                    songStats.artists.at(-1)
                  )}
                </strong>
              </StatSubText>
            </StatText>
            <StatText>
              ▸ Play <strong>directly</strong> in the browser
              <StatSubText>
                No <strong>download</strong> needed
              </StatSubText>
            </StatText>
            <StatText>
              ▸ Use <strong>phones</strong> as microphones
              <StatSubText>No need to download an app</StatSubText>
            </StatText>
            <StatText>
              ▸ Supports <strong>1-4</strong> players
              <StatSubText>When using phones as microphones</StatSubText>
            </StatText>
            <StatText>
              ▸ <strong>100% Free</strong> and open source
              <StatSubText>
                Check the{' '}
                <a href="https://github.com/Asvarox/allkaraoke" target="_blank" rel="noreferrer">
                  GitHub repository
                </a>
              </StatSubText>
            </StatText>
          </StatSegment>
          <ScreenshotSegment>
            <img src={screenshot1} alt="Song list screen" />
            {newScreenshot === 'test' ? (
              <img src={screenshot2} alt="In-game screen" />
            ) : (
              <img src={screenshot3} alt="In-game screen" />
            )}
          </ScreenshotSegment>
        </Stats>
        <JoinExistingTip>
          Using this device as remote microphone?
          <SmoothLink to="remote-mic/">
            <a data-test="join-existing-game">Join existing game</a>
          </SmoothLink>
        </JoinExistingTip>
        <MobileButtonsContainer>
          <SmoothLink to="remote-mic/">
            <PlayButton data-test="join-existing-game" focused>
              <span>
                Join game (with <strong>Game Code</strong>)
              </span>
            </PlayButton>
          </SmoothLink>
          <SmoothLink to="quick-setup/">
            <PlayButton data-test="enter-the-game">Start new game</PlayButton>
          </SmoothLink>
        </MobileButtonsContainer>
      </Container>
    </LayoutGame>
  );
}

const LogoContainer = styled.div`
  display: flex;
  gap: 6rem;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 6rem;
  padding: 6rem;
  box-sizing: border-box;
  width: 110rem;
  font-size: 2.3rem;
  ${mobileMQ} {
    width: 90%;
    flex-direction: column;
    font-size: 8.5rem;
  }
  ${landscapeMQ} {
    font-size: 4.9rem;
  }
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);

  hr {
    margin: 3rem 0;
  }
`;

const StatsDescription = styled.span`
  line-height: 1.5;
  text-align: justify;

  ${mobileMQ} {
    font-size: 8.5rem;
  }
  ${landscapeMQ} {
    font-size: 4.9rem;
  }
`;

const StatText = styled.div``;
const StatSubText = styled.div`
  padding-top: 0.5rem;
  font-size: 0.7em;
  text-align: right;

  .Typewriter {
    display: inline;
  }
`;

const StatSegment = styled.div`
  ${typography};
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
`;

const ScreenshotSegment = styled(StatSegment)`
  ${landscapeMQ} {
    display: none;
  }

  ${mobileMQ} {
    flex-direction: row;
  }

  gap: 4rem;

  img {
    width: 100%;

    ${mobileMQ} {
      // 2rem - the gap (4rem) divided by 2
      width: calc(50% - 2rem);
      height: 50rem;
    }

    aspect-ratio: 16 / 9;
    object-fit: cover;
    box-shadow: 0 0 5rem rgba(114, 155, 255, 0.5);
    border-radius: 1rem;
  }

  img:nth-of-type(2) {
    box-shadow: 0 0 10rem rgb(19, 19, 19);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  ${landscapeMQ} {
    flex-direction: row;
  }
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 3rem;

  strong,
  a {
    text-shadow: 0 0 5rem ${styles.colors.text.active};
  }
`;

const MobileButtonsContainer = styled(MobileOnly)`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  //flex: 0.5;
  width: 90%;

  a {
    width: 100%;
    flex: 1;
    min-height: 30rem;
  }
`;

const JoinExistingTip = styled.h3`
  ${mobileMQ} {
    display: none;
  }
  text-align: right;
  width: 110rem;
  margin-top: -2.5rem !important;
`;

const PlayButton = styled(LinkButton)`
  font-size: 9rem;
  padding: 1rem 7rem;
  background: black;
  width: 110rem;
  ${focusable};
  transform: none;
`;

export default LandingPage;
