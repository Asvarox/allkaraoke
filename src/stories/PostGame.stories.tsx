import { Meta, StoryFn } from '@storybook/react';
import { DetailedScore, Song } from 'interfaces';
import { ComponentProps } from 'react';
import { MAX_POINTS, sumDetailedScore } from 'Scenes/Game/Singing/GameState/Helpers/calculateScore';
import PostGameView from 'Scenes/Game/Singing/PostGame/PostGameView';
import tuple from 'utils/tuple';
import song from '../../public/songs/2 Plus 1-Chodz, Pomaluj Mój Swiat.json';

interface StoryArgs {
    player1Score: number;
    player2Score: number;
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'PostGame',
    component: PostGameView,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        player1Score: { control: 'range', min: 0, max: 100 },
        player2Score: { control: 'range', min: 0, max: 100 },
    },
    args: {
        player1Score: 69,
        player2Score: 70,
    },
} as Meta<ComponentProps<typeof PostGameView>>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<StoryArgs> = (args) => {
    const maxPoints: DetailedScore = {
        freestyle: 10,
        rap: 10,
        star: 90,
        normal: 705,
        perfect: 375,
        vibrato: 187.5,
    };
    const players = [
        {
            name: 'Player #1',
            detailedScore: tuple([
                MAX_POINTS / sumDetailedScore(maxPoints),
                {
                    freestyle: (args.player1Score / 100) * maxPoints.freestyle,
                    rap: (args.player1Score / 100) * maxPoints.rap,
                    star: (args.player1Score / 100) * maxPoints.star,
                    normal: (args.player1Score / 100) * maxPoints.normal,
                    perfect: (args.player1Score / 100) * maxPoints.perfect,
                    vibrato: (args.player1Score / 100) * maxPoints.vibrato,
                },
                maxPoints,
            ]),
        },
        {
            name: 'Player #2',
            detailedScore: tuple([
                MAX_POINTS / sumDetailedScore(maxPoints),
                {
                    freestyle: (args.player2Score / 100) * maxPoints.freestyle,
                    rap: (args.player2Score / 100) * maxPoints.rap,
                    star: (args.player2Score / 100) * maxPoints.star,
                    normal: (args.player2Score / 100) * maxPoints.normal,
                    perfect: (args.player2Score / 100) * maxPoints.perfect,
                    vibrato: (args.player2Score / 100) * maxPoints.vibrato,
                },
                maxPoints,
            ]),
        },
    ];

    return (
        <PostGameView
            singSetupId="storybook-id"
            players={players}
            width={1280}
            height={720}
            onClickSongSelection={() => undefined}
            song={song as Song}
            highScores={[
                {
                    singSetupId: 'some-other-sings',
                    name: players[0].name,
                    date: '2022-10-10',
                    score: 2_400_000,
                },
                {
                    singSetupId: 'some-other-sings',
                    name: players[0].name,
                    date: '2022-10-10',
                    score: 2_400_000,
                },
                {
                    singSetupId: 'some-other-sings',
                    name: players[0].name,
                    date: '2022-10-10',
                    score: 2_400_000,
                },
                {
                    singSetupId: 'some-other-sings',
                    name: players[0].name,
                    date: '2022-10-10',
                    score: 2_400_000,
                },
                {
                    singSetupId: 'storybook-id',
                    name: players[1].name,
                    score: sumDetailedScore(players[1].detailedScore[1]) * players[1].detailedScore[0],
                    date: '2022-10-10',
                },
            ]}
        />
    );
};

export const PostGameStory = Template.bind({});
