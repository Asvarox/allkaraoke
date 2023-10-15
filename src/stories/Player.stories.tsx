import { Meta, StoryFn } from '@storybook/react';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import Player, { PlayerRef } from 'Scenes/Game/Singing/Player';
import convertTxtToSong from 'Songs/utils/convertTxtToSong';
import { GAME_MODE, PlayerSetup, SingSetup } from 'interfaces';
import { ComponentProps, useEffect, useRef } from 'react';
import { ValuesType } from 'utility-types';

interface StoryArgs {
  tolerance: number;
  speed: number;
  gameMode: ValuesType<typeof GAME_MODE>;
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Game/Singing/Player',
  component: Player,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    speed: { control: { type: 'range', min: 1, max: 200, step: 1 } },
    tolerance: { control: { type: 'range', min: 0, max: 6, step: 1 } },
    gameMode: { control: 'radio', options: [GAME_MODE.DUEL, GAME_MODE.PASS_THE_MIC, GAME_MODE.CO_OP] },
  },
  args: {
    tolerance: 3,
    speed: 100,
    gameMode: GAME_MODE.DUEL,
  },
} as Meta<ComponentProps<typeof Player>>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<StoryArgs> = (args) => {
  // GameState.setSong(song as Song);

  const singSetup: SingSetup = {
    tolerance: args.tolerance,
    players: [
      { number: 0, track: 0 },
      { number: 1, track: 0 },
    ],
    id: 'storybook-id',
    mode: args.gameMode,
  };

  const players: PlayerSetup[] = [
    {
      number: 0,
      track: 0,
    },
  ];

  const ref = useRef<PlayerRef | null>(null);

  const song = convertTxtToSong(txtfile);
  song.bpm = song.bpm * (args.speed / 100);

  useEffect(() => {
    ref.current?.play();
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <Player
        autoplay={false}
        ref={ref}
        onSongEnd={() => {
          GameState.resetSingSetup();
          GameState.setSingSetup(singSetup);

          setTimeout(() => {
            ref.current?.play();
          }, 100);
        }}
        players={players}
        singSetup={singSetup}
        width={1280}
        height={720}
        song={song}
      />
    </div>
  );
};

const txtfile = `
#TITLE:test
#ARTIST:convert
#LANGUAGE:English
#GENRE:genre
#REALBPM:200
#VOLUME:0.25
#YEAR:1992
#VIDEOGAP:30
#VIDEOID:mcEVAY1H5As
#BPM:200
#GAP:1000
: 7 4 59 When
: 11 4 59  you're
- 20
: 20 4 59 And
: 24 4 59  life
: 28 4 59  is
: 32 4 61  mak
: 36 4 64 ing
: 40 4 61  you
: 44 8 59  lone
: 52 3 63 ly
- 56
: 56 4 66 You
: 60 4 63  can
: 64 4 64  al
: 68 7 68 ways
: 75 12 59  go
- 90
: 103 8 64 Down
: 111 8 59 town
- 121
: 127 4 59 When
: 131 4 59  you've
: 135 4 59  got
: 139 7 59  wor
: 146 3 59 ries
- 150
: 150 4 59 All
: 154 4 59  the
: 158 4 61  noise
: 162 4 64  and
: 166 4 61  the
: 170 8 59  hur
: 178 3 63 ry
- 182
: 182 4 66 Seems
: 186 4 63  to
: 190 4 64  help
: 194 8 68  I
: 202 12 59  know
: 230 8 64  down
: 238 8 59 town
- 248
: 250 4 59 Just
: 254 4 69  li
: 258 4 68 sten
: 262 4 68  to
: 266 4 66  the
: 270 4 69  mu
: 274 3 68 sic
- 278
: 278 4 68 Of
: 282 4 66  the
: 286 4 64  traf
: 290 4 66 fic
: 294 4 64  in
: 298 4 63  the
: 302 2 61  ci
: 304 6 64 ty
- 312
: 318 4 69 Lin
: 322 4 68 ger
: 326 4 68  on
: 330 4 66  the
: 334 4 69  side
: 338 3 68 walk
: 7 4 59 Second
: 11 4 59  Track
`;

export const GameSingingPlayerStory = Template.bind({});
