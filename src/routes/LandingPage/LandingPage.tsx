import { ButtonLink } from 'modules/Elements/AKUI/Button';
import Box from 'modules/Elements/AKUI/Primitives/Box';
import Text from 'modules/Elements/AKUI/Primitives/Text';
import { useBackground } from 'modules/Elements/LayoutWithBackground';
import Logo from 'modules/Elements/Logo';
import SmoothLink from 'modules/Elements/SmoothLink';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHotkeys } from 'react-hotkeys-hook';
import { twc } from 'react-twc';
import GithubRibbon from 'routes/Welcome/GithubRibbon';
import Typewriter from 'typewriter-effect';
import LogoIcon from './LogoIcon';
import screenshot1 from './screenshot1.webp';
import screenshot2 from './screenshot2.webp';
import songStats from './songStats.json';

export const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

function LandingPage() {
  const navigate = useSmoothNavigate();

  useBackground(true);

  const nextPage = 'menu/';

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
    <>
      <Helmet>
        <title>AllKaraoke.Party - Free Online Karaoke Party Game</title>
      </Helmet>
      <GithubRibbon />
      <div className="flex flex-col w-[110rem] items-stretch justify-center h-screen gap-12 mx-auto landscap:flex-row landscap:w-full mobile:w-full shadow-active [&_strong]:[text-shadow:_0_0_5rem_var(--tw-shadow-color)] [&_a]:[text-shadow:_0_0_5rem_var(--tw-shadow-color)]">
        <div className="flex justify-center gap-24 mobile:hidden">
          <LogoIcon />
          <Logo />
        </div>
        <SmoothLink to={nextPage}>
          <PlayButton data-test="enter-the-game" className="mobile:hidden">
            Enter the game
          </PlayButton>
        </SmoothLink>
        <Box className="gap-24 p-24 flex-row bg-black/75 landscap:flex-1 [&_hr]:my-12 mobile:flex-col">
          <StatSegment>
            <div className="leading-normal text-justify">
              <strong>AllKaraoke</strong> is a free online karaoke game inspired by PlayStation&#39;s{' '}
              <strong>SingStar</strong>. Sing along to your favorite songs and compete with your friends, all through
              the browser! Updated almost weekly with new songs and features.
            </div>
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
          <StatSegment className="gap-16 mobile:flex-row landscap:hidden">
            <Screenshot
              src={screenshot1}
              alt="Song list screen"
              className="[box-shadow:_0_0_5rem_rgba(114,155,255,0.5)]"
            />
            <Screenshot src={screenshot2} alt="In-game screen" className="[box-shadow:_0_0_10rem_rgb(19,19,19)]" />
          </StatSegment>
        </Box>
        <Text className="mobile:hidden text-md text-right !mt-[-2.5rem]">
          Using this device as remote microphone?{' '}
          <SmoothLink to="remote-mic/">
            <a data-test="join-existing-game">Join existing game</a>
          </SmoothLink>
        </Text>
        <div className="flex flex-col gap-12 landscap:flex-1 [&&_a]:min-h-[30rem] justify-center">
          <SmoothLink to="remote-mic/">
            <PlayButton data-test="join-existing-game" className="hidden mobile:flex">
              <span>
                Join game (with <strong>Game Code</strong>)
              </span>
            </PlayButton>
          </SmoothLink>
          <SmoothLink to="quick-setup/">
            <PlayButton data-test="enter-the-game" className="hidden mobile:flex">
              Start new game
            </PlayButton>
          </SmoothLink>
        </div>
      </div>
    </>
  );
}

const StatText = twc.div``;
const StatSubText = twc.div`pt-2 text-right text-[0.7em] [&_.Typewriter]:inline`;

const StatSegment = twc(
  Text,
)`flex flex-col flex-1 gap-4 typography text-[2.3rem] mobile:text-[8.5rem] landscap:text-[4.9rem]`;

const Screenshot = twc.img`w-full aspect-video object-cover shadow-5 border-1 border-black/50 rounded-2xl mobile:w-[calc(50%-2rem)] mobile:h-[50rem]`;

const PlayButton = twc(ButtonLink)`text-[9rem] bg-black w-full px-28 py-4 animate-focused`;

export default LandingPage;
