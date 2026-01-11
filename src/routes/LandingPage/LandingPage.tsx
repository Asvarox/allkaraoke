import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHotkeys } from 'react-hotkeys-hook';
import { twc } from 'react-twc';
import Typewriter from 'typewriter-effect';
import { ButtonLink } from '~/modules/Elements/AKUI/Button';
import Box from '~/modules/Elements/AKUI/Primitives/Box';
import Typography from '~/modules/Elements/AKUI/Primitives/Typography';
import { useBackground } from '~/modules/Elements/BackgroundContext';
import Logo from '~/modules/Elements/Logo';
import SmoothLink from '~/modules/Elements/SmoothLink';
import useSmoothNavigate from '~/modules/hooks/useSmoothNavigate';
import GithubRibbon from '~/routes/Welcome/GithubRibbon';
import LogoIcon from './LogoIcon';
import screenshot1 from './screenshot1.webp';
import screenshot2 from './screenshot2.webp';
import songStats from './songStats.json';

const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

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
      <div className="shadow-active mobile:w-full landscap:w-full landscap:flex-row mx-auto flex h-screen w-[110rem] flex-col items-stretch justify-center gap-12 [&_a]:[text-shadow:_0_0_5rem_var(--tw-shadow-color)] [&_strong]:[text-shadow:_0_0_5rem_var(--tw-shadow-color)]">
        <div className="mobile:hidden flex justify-center gap-24">
          <LogoIcon />
          <Logo />
        </div>
        <SmoothLink to={nextPage}>
          <PlayButton data-test="enter-the-game" className="mobile:hidden">
            Enter the game
          </PlayButton>
        </SmoothLink>
        <Box className="mobile:flex-col landscap:flex-1 flex-row gap-24 bg-black/75 p-24 [&_hr]:my-12">
          <StatSegment>
            <div className="text-justify leading-normal">
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
          <StatSegment className="mobile:flex-row landscap:hidden gap-16">
            <Screenshot
              src={screenshot1}
              alt="Song list screen"
              className="[box-shadow:_0_0_5rem_rgba(114,155,255,0.5)]"
            />
            <Screenshot src={screenshot2} alt="In-game screen" className="[box-shadow:_0_0_10rem_rgb(19,19,19)]" />
          </StatSegment>
        </Box>
        <Typography className="text-md mobile:hidden mt-[-2.5rem]! text-right">
          Using this device as remote microphone?{' '}
          <SmoothLink to="remote-mic/">
            <a data-test="join-existing-game">Join existing game</a>
          </SmoothLink>
        </Typography>
        <div className="landscap:flex-1 flex flex-col justify-center gap-12 [&&_a]:min-h-[30rem]">
          <SmoothLink to="remote-mic/">
            <PlayButton data-test="join-existing-game" className="mobile:flex hidden">
              <span>
                Join game (with <strong>Game Code</strong>)
              </span>
            </PlayButton>
          </SmoothLink>
          <SmoothLink to="quick-setup/">
            <PlayButton data-test="enter-the-game" className="mobile:flex hidden">
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
  Typography,
)`flex flex-col flex-1 gap-4 typography text-[2.3rem] mobile:text-[8.5rem] landscap:text-[4.9rem]`;

const Screenshot = twc.img`w-full aspect-video object-cover shadow-5 border-1 border-black/50 rounded-2xl mobile:w-[calc(50%-2rem)] mobile:h-[50rem]`;

const PlayButton = twc(ButtonLink)`text-[9rem] bg-black w-full px-28 py-4 animate-focused`;

export default LandingPage;
