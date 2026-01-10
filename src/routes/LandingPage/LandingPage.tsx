import { ButtonLink } from 'modules/Elements/AKUI/Button';
import Box from 'modules/Elements/AKUI/Primitives/Box';
import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import { useBackground } from 'modules/Elements/BackgroundContext';
import Logo from 'modules/Elements/Logo';
import SmoothLink from 'modules/Elements/SmoothLink';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHotkeys } from 'react-hotkeys-hook';
import { twc } from 'react-twc';
import GithubRibbon from 'routes/Welcome/GithubRibbon';
import Typewriter from 'typewriter-effect';
import { twx } from 'utils/twx';
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
      <div className="mobile:w-full mobile:h-auto landscap:w-full landscap:flex-row mx-auto flex min-h-screen w-[72rem] flex-col items-stretch justify-center gap-4 [&_a]:[text-shadow:_0_0_5rem_var(--tw-shadow-color)] [&_strong]:[text-shadow:_0_0_5rem_var(--tw-shadow-color)]">
        <div className="mobile:hidden flex justify-center gap-6 text-6xl">
          <LogoIcon />
          <Logo />
        </div>
        <SmoothLink to={nextPage}>
          <PlayButton data-test="enter-the-game" className="mobile:hidden h-26">
            Enter the game
          </PlayButton>
        </SmoothLink>
        <Box className="mobile:flex-col landscap:flex-1 mobile:p-4 mobile:rounded-[0] flex-row gap-6 bg-black/75 p-10 [&_hr]:my-3">
          <StatSegment className="h-full justify-between">
            <div className="mobile:text-md text-justify text-lg leading-normal">
              <strong>AllKaraoke</strong> is a free online karaoke game inspired by PlayStation&#39;s{' '}
              <strong>SingStar</strong>. Sing along to your favorite songs and compete with your friends, all through
              the browser! Updated almost weekly with new songs and features.
            </div>
            <hr />
            <div className="flex flex-col gap-2">
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
            </div>
          </StatSegment>
          <StatSegment className="mobile:flex-row landscap:hidden mobile:gap-2 gap-10">
            <Screenshot
              src={screenshot1}
              alt="Song list screen"
              className="[box-shadow:_0_0_3rem_rgba(114,155,255,0.5)]"
            />
            <Screenshot src={screenshot2} alt="In-game screen" className="[box-shadow:_0_0_6rem_rgb(19,19,19)]" />
          </StatSegment>
        </Box>
        <Typography className="text-md mobile:hidden text-right">
          Using this device as remote microphone?{' '}
          <SmoothLink to="remote-mic/">
            <a data-test="join-existing-game">Join existing game</a>
          </SmoothLink>
        </Typography>
        <div className="landscap:flex-1 flex flex-col justify-stretch">
          <div className="landscap:fixed top-0 right-0 left-[calc(50vw+1rem)] flex flex-col gap-6">
            <SmoothLink to="remote-mic/">
              <PlayButton data-test="join-existing-game" className="mobile:flex hidden h-28">
                <span className="text-lg">
                  Join game
                  <div className="text-sm">
                    (using <strong>game code</strong>)
                  </div>
                </span>
              </PlayButton>
            </SmoothLink>
            <SmoothLink to="quick-setup/">
              <PlayButton data-test="enter-the-game" className="mobile:flex hidden h-28 !text-lg">
                Start new game
              </PlayButton>
            </SmoothLink>
          </div>
        </div>
      </div>
    </>
  );
}

const StatText = twc.div`text-lg mobile:text-md`;
const StatSubText = twc.div`pt-1 text-right text-md mobile:text-sm [&_.Typewriter]:inline`;

const StatSegment = twc.div`flex flex-col flex-1 justify-center typography text-xl `;

const Screenshot = twc.img`w-full aspect-video object-cover shadow-5 border-1 border-black/50 rounded-2xl mobile:w-[calc(50vw_-_1rem)]`;

const PlayButton = twx(ButtonLink)`text-5xl mobile:text-2xl bg-black w-full px-4 py-4 animate-focused`;

export default LandingPage;
