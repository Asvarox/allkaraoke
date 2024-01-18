import { Meta, StoryFn } from '@storybook/react';
import PlayersManager from 'Players/PlayersManager';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import Player, { PlayerRef } from 'Scenes/Game/Singing/Player';
import { processSong } from 'Songs/hooks/useSong';
import convertTxtToSong from 'Songs/utils/convertTxtToSong';
import { GAME_MODE, SingSetup } from 'interfaces';
import { ComponentProps, useEffect, useRef } from 'react';
import { ValuesType } from 'utility-types';

interface StoryArgs {
  tolerance: number;
  speed: number;
  playerNum: number;
  gameMode: ValuesType<typeof GAME_MODE>;
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Game/Singing/Player',
  component: Player,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    playerNum: { control: { type: 'range', min: 1, max: 4, step: 1 } },
    speed: { control: { type: 'range', min: 1, max: 200, step: 1 } },
    tolerance: { control: { type: 'range', min: 0, max: 6, step: 1 } },
    gameMode: { control: 'radio', options: [GAME_MODE.DUEL, GAME_MODE.PASS_THE_MIC, GAME_MODE.CO_OP] },
  },
  args: {
    playerNum: 2,
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
    players: new Array(args.playerNum).fill(0).map((t, i) => ({ number: i as 0 | 1 | 2 | 3, track: 0 })),
    id: 'storybook-id',
    mode: args.gameMode,
  };
  PlayersManager.getPlayers().forEach((player) => PlayersManager.removePlayer(player.number));
  singSetup.players.map((player) => PlayersManager.addPlayer(player.number));

  console.log(singSetup, PlayersManager.getPlayers());
  useEffect(() => {
    GameState.resetSingSetup();
    GameState.setSingSetup(singSetup);
    GameState.setSong(song);
  }, [args.tolerance, args.playerNum, args.gameMode]);

  const ref = useRef<PlayerRef | null>(null);

  const song = processSong(convertTxtToSong(txtfile));
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
          GameState.setSong(song);

          setTimeout(() => {
            ref.current?.play();
          }, 100);
        }}
        players={singSetup.players}
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
#VIDEOGAP:0
#VIDEOID:W9nZ6u15yis
#BPM:200
#GAP:500
R 0 4 1 When
F 6 2 0  a
* 9 2 -2  hum
G 11 4 -4 ble
: 16 6 -2  bard
- 30
* 36 8 3 Graced
* 44 3 5  a
* 47 6 1  ride
: 53 2 0  a
: 55 8 -2 long
- 66
: 67 3 -2 With
: 70 4 3  Ge
: 74 5 3 ralt
: 79 11 5  of
: 90 3 1  Rivia
: 93 3 0 ~
: 96 3 -2 ~
- 102
: 105 3 -2 A
: 108 6 3 long
: 114 7 1  came
: 121 6 3  this
: 137 16 5  song
- 173
: 194 5 -7 From
: 199 4 1  when
: 203 3 0  the
: 206 5 -2  White
: 211 4 -4  Wolf
: 215 6 -2  fought
`;

export const GameSingingPlayerStory = Template.bind({});
