export const blueFill = (a = 1) => `rgba(0, 153, 255, ${a})`;
export const blueStroke = (a = 1) => `rgba(0, 77, 128, ${a})`;
export const redFill = (a = 1) => `rgba(255, 54, 54, ${a})`;
export const redStroke = (a = 1) => `rgba(117, 25, 25, ${a})`;

const playerColors = [
    {
        gold: {
            fill: 'rgba(255, 183, 0, .5)',
            stroke: 'rgba(255, 183, 0, 0)',
            lineWidth: 1,
        },
        perfect: {
            fill: blueFill(1),
            stroke: 'white',
            lineWidth: 1,
        },
        goldPerfect: {
            fill: 'rgba(255, 213, 0, 1)',
            stroke: 'rgba(255, 183, 0, 1)',
            lineWidth: 2,
        },
        hit: {
            fill: blueFill(0.9),
            stroke: blueStroke(0),
            lineWidth: 1,
        },
        miss: {
            fill: blueFill(0.25),
            stroke: blueStroke(1),
            lineWidth: 1,
        },
        vibrato: {
            fill: 'white',
            stroke: 'white',
            lineWidth: 1,
        },
    },
    {
        gold: {
            fill: 'rgba(255, 183, 0, .5)',
            stroke: 'rgba(255, 183, 0, 0)',
            lineWidth: 1,
        },
        vibrato: {
            fill: 'white',
            stroke: 'white',
            lineWidth: 1,
        },
        perfect: {
            fill: redFill(1),
            stroke: 'white',
            lineWidth: 1,
        },
        goldPerfect: {
            fill: 'rgba(255, 213, 0, 1)',
            stroke: 'rgba(255, 183, 0, 1)',
            lineWidth: 2,
        },
        hit: {
            fill: redFill(0.9),
            stroke: redStroke(0),
            lineWidth: 1,
        },
        miss: {
            fill: redFill(0.25),
            stroke: redStroke(1),
            lineWidth: 1,
        },
    },
];

const styles = {
    colors: {
        players: playerColors,
        lines: {
            normal: {
                fill: 'grey',
                stroke: 'black',
                lineWidth: 1,
            },
            gold: {
                fill: 'rgba(158, 144, 106, 1)',
                stroke: 'rgba(255, 183, 0, 1)',
                lineWidth: 1,
            },
            freestyle: {
                fill: 'rgba(255, 255, 255, 0.1)',
                stroke: 'black',
                lineWidth: 2,
            },
        },
        text: {
            active: 'orange',
            default: 'white',
            inactive: 'grey',
        },
    },
};

export default styles;
