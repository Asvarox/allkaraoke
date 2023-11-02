// import songs from '../../../public/songs/index.json';
import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import { useBackground } from 'Elements/LayoutWithBackground';
import Logo from 'Elements/Logo';
import { focused, typography } from 'Elements/cssMixins';
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
        <LogoContainer>
          <LogoIcon />
          <Logo />
        </LogoContainer>
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
          <StatSegment>
            <img src={screenshot1} alt="Song list screen" />
            <img src={screenshot2} alt="In-game screen" />
          </StatSegment>
        </Stats>
        <PlayButton onClick={() => navigate('/quick-setup')} data-test="enter-the-game">
          Enter the game
        </PlayButton>
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

const StatSegment = styled.div`
  ${typography};
  font-size: 2.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  img {
    margin-bottom: 4rem;
    width: 100%;
    object-fit: cover;
    box-shadow: 0 0 2rem white;
    border-radius: 1rem;
  }
  img:last-of-type {
    margin-bottom: 0;
  }
`;
const StatText = styled.div`
  height: 7rem;
`;
const StatSubText = styled.div`
  padding-top: 0.5rem;
  font-size: 1.75rem;
  text-align: right;

  .Typewriter {
    display: inline;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 3rem;
`;

const PlayButton = styled(Button)`
  font-size: 9rem;
  padding: 1rem 7rem;
  background: black;
  width: 110rem;
  ${focused};
`;

export default LandingPage;
