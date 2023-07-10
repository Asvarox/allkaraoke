import { Meta, StoryFn } from '@storybook/react';
import { MAX_POINTS, sumDetailedScore } from 'Scenes/Game/Singing/GameState/Helpers/calculateScore';
import PostGameView from 'Scenes/Game/Singing/PostGame/PostGameView';
import { DetailedScore, GAME_MODE, SingSetup, Song } from 'interfaces';
import { ComponentProps } from 'react';
import { ValuesType } from 'utility-types';
import tuple from 'utils/tuple';
import song from '../../public/songs/2 Plus 1-Chodz, Pomaluj Mój Swiat.json';

interface StoryArgs {
    player1Score: number;
    player2Score: number;
    gameMode: ValuesType<typeof GAME_MODE>;
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'PostGame',
    component: PostGameView,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        player1Score: { control: 'range', min: 0, max: 100 },
        player2Score: { control: 'range', min: 0, max: 100 },
        gameMode: { control: 'radio', options: [GAME_MODE.DUEL, GAME_MODE.PASS_THE_MIC, GAME_MODE.CO_OP] },
    },
    args: {
        player1Score: 69,
        player2Score: 70,
        gameMode: GAME_MODE.DUEL,
    },
} as Meta<ComponentProps<typeof PostGameView>>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<StoryArgs> = (args) => {
    // GameState.setSong(song as Song);

    const singSetup: SingSetup = {
        tolerance: 2,
        players: [
            { number: 0, track: 0 },
            { number: 1, track: 0 },
        ],
        id: 'storybook-id',
        mode: args.gameMode,
    };

    const maxPoints: DetailedScore = {
        freestyle: 10,
        rap: 10,
        star: 90,
        normal: 705,
        perfect: 375,
        vibrato: 187.5,
    };

    const pointsPerBeat = MAX_POINTS / sumDetailedScore(maxPoints);

    const players = [
        {
            name: 'Player #1',
            playerNumber: 0,
            detailedScore: tuple([
                {
                    freestyle: (args.player1Score / 100) * maxPoints.freestyle * pointsPerBeat,
                    rap: (args.player1Score / 100) * maxPoints.rap * pointsPerBeat,
                    star: (args.player1Score / 100) * maxPoints.star * pointsPerBeat,
                    normal: (args.player1Score / 100) * maxPoints.normal * pointsPerBeat,
                    perfect: (args.player1Score / 100) * maxPoints.perfect * pointsPerBeat,
                    vibrato: (args.player1Score / 100) * maxPoints.vibrato * pointsPerBeat,
                },
                maxPoints,
            ]),
        },
        {
            name: 'Player #2',
            playerNumber: 1,
            detailedScore: tuple([
                {
                    freestyle: (args.player2Score / 100) * maxPoints.freestyle * pointsPerBeat,
                    rap: (args.player2Score / 100) * maxPoints.rap * pointsPerBeat,
                    star: (args.player2Score / 100) * maxPoints.star * pointsPerBeat,
                    normal: (args.player2Score / 100) * maxPoints.normal * pointsPerBeat,
                    perfect: (args.player2Score / 100) * maxPoints.perfect * pointsPerBeat,
                    vibrato: (args.player2Score / 100) * maxPoints.vibrato * pointsPerBeat,
                },
                maxPoints,
            ]),
        },
    ];

    return (
        <PostGameView
            singSetup={singSetup}
            players={players}
            width={1980}
            height={1080}
            onClickSongSelection={() => undefined}
            song={song as Song}
            highScores={[
                {
                    singSetupId: 'some-other-sings1',
                    name: players[0].name,
                    date: '2022-10-10',
                    score: 2_400_000,
                },
                {
                    singSetupId: 'some-other-sings2',
                    name: players[0].name,
                    date: '2022-10-10',
                    score: 2_400_000,
                },
                {
                    singSetupId: 'some-other-sings3',
                    name: players[0].name,
                    date: '2022-10-10',
                    score: 2_400_000,
                },
                {
                    singSetupId: 'some-other-sings3',
                    name: players[0].name,
                    date: '2022-10-10',
                    score: 2_400_000,
                },
                {
                    singSetupId: 'storybook-id',
                    name: players[1].name,
                    score: sumDetailedScore(players[1].detailedScore[1]) * pointsPerBeat,
                    date: '2022-10-10',
                },
            ]}
        />
    );
};

export const PostGameStory = Template.bind({});
