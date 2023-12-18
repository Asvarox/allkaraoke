// import songs from '../../../public/songs/index.json';
import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { useBackground } from 'Elements/LayoutWithBackground';
import Logo from 'Elements/Logo';
import { DesktopOnly, MobileOnly } from 'Elements/RWD';
import { focusable, landscapeMQ, mobileMQ, typography } from 'Elements/cssMixins';
import Background from 'Scenes/LandingPage/Background';
import GithubRibbon from 'Scenes/Welcome/GithubRibbon';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import Typewriter from 'typewriter-effect';
import LogoIcon from './LogoIcon';
import screenshot1 from './screenshot1.webp';
import screenshot2 from './screenshot2.webp';
import songStats from './songStats.json';

function LandingPage() {
  const navigate = useSmoothNavigate();
  useBackground(true);

  return (
    <>
      <GithubRibbon />
      <Background />
      <Container>
        <DesktopOnly>
          <LogoContainer>
            <LogoIcon />
            <Logo />
          </LogoContainer>
        </DesktopOnly>
        <DesktopOnly>
          <PlayButton onClick={() => navigate('quick-setup')} data-test="enter-the-game" focused>
            Enter the game
          </PlayButton>
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
              ▸ <strong>{songStats.songs}</strong> songs in <strong>{songStats.languages.length}</strong> languages
              <StatSubText>
                Artists such as{' '}
                <strong>
                  <Typewriter
                    options={{
                      strings: songStats.artists,
                      autoStart: true,
                      loop: true,
                      delay: 100,
                    }}
                  />
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
            <img src={screenshot2} alt="In-game screen" />
          </ScreenshotSegment>
        </Stats>
        <JoinExistingTip>
          Using this device as remote microphone?
          <button onClick={() => navigate('remote-mic')} data-test="join-existing-game">
            Join existing game
          </button>
        </JoinExistingTip>
        <MobileButtonsContainer>
          <PlayButton onClick={() => navigate('remote-mic')} data-test="join-existing-game" focused>
            Join game (with <strong>Game Code</strong>)
          </PlayButton>
          <PlayButton onClick={() => navigate('quick-setup')} data-test="enter-the-game">
            Start new game
          </PlayButton>
        </MobileButtonsContainer>
      </Container>
    </>
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
  font-size: 2.5rem;
  ${mobileMQ} {
    width: 90%;
    flex-direction: column;
    font-size: 5rem;
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
`;

const StatText = styled.div``;
const StatSubText = styled.div`
  padding-top: 0.5rem;
  font-size: 0.6em;
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
    }
    aspect-ratio: 16 / 9;
    object-fit: cover;
    box-shadow: 0 0 2rem white;
    border-radius: 1rem;
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
`;

const MobileButtonsContainer = styled(MobileOnly)`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  //flex: 0.5;
  width: 90%;

  button {
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

const PlayButton = styled(Button)`
  font-size: 9rem;
  padding: 1rem 7rem;
  background: black;
  width: 110rem;
  ${focusable};
  transform: none;
`;

export default LandingPage;
