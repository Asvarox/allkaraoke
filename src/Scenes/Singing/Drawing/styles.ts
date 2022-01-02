const playerColors = [
    {
        hit: {
            fill: 'rgba(0, 0, 255, 1)',
            stroke: 'rgba(0, 0, 255, 0)',
        },
        miss: {
            fill: 'rgba(0, 0, 255, .5)',
            stroke: 'rgba(0, 0, 255, 1)',
        }
    },
    {
        hit: {
            fill: 'rgba(255, 0, 0, 1)',
            stroke: 'rgba(255, 0, 0, 0)',
        },
        miss: {
            fill: 'rgba(255, 0, 0, .5)',
            stroke: 'rgba(255, 0, 0, .5)',
        }
    },
];

const styles = {
    colors: {
        players: playerColors,
        lines: {
            fill: 'grey',
            stroke: 'black',
        },
    },
}

export default styles;