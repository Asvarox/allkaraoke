import { createDataSequence, generateFrequencyRecords } from 'utils/testUtils';
import detectVibrato from './detectVibrato';

const data = [
    {
        timestamp: 43997.08410299683,
        frequency: 5478.03076171875,
    },
    {
        timestamp: 44019.083938964846,
        frequency: 5478.03076171875,
    },
    {
        timestamp: 44039.08391989136,
        frequency: 5478.03076171875,
    },
    {
        timestamp: 44057.08404577637,
        frequency: 5478.03076171875,
    },
    {
        timestamp: 44077.08402670288,
        frequency: 5478.03076171875,
    },
    {
        timestamp: 44098.08393515015,
        frequency: 290.0567321777344,
    },
    {
        timestamp: 44117.08398855591,
        frequency: 290.0567321777344,
    },
    {
        timestamp: 44138.36113542175,
        frequency: 290.0567321777344,
    },
    {
        timestamp: 44156.36102288818,
        frequency: 290.0567321777344,
    },
    {
        timestamp: 44175.36107629394,
        frequency: 290.0567321777344,
    },
    {
        timestamp: 44198.36107820129,
        frequency: 282.47552490234375,
    },
    {
        timestamp: 44216.36096566772,
        frequency: 282.47552490234375,
    },
    {
        timestamp: 44235.36101907348,
        frequency: 282.47552490234375,
    },
    {
        timestamp: 44254.361072479245,
        frequency: 282.47552490234375,
    },
    {
        timestamp: 44274.36105340576,
        frequency: 314.14764404296875,
    },
    {
        timestamp: 44294.36103433227,
        frequency: 314.14764404296875,
    },
    {
        timestamp: 44312.3609217987,
        frequency: 314.14764404296875,
    },
    {
        timestamp: 44331.360975204465,
        frequency: 314.14764404296875,
    },
    {
        timestamp: 44350.36102861023,
        frequency: 314.14764404296875,
    },
    {
        timestamp: 44369.36108201599,
        frequency: 299.66253662109375,
    },
    {
        timestamp: 44388.46313542175,
        frequency: 299.66253662109375,
    },
    {
        timestamp: 44407.46295040893,
        frequency: 299.66253662109375,
    },
    {
        timestamp: 44426.46300381469,
        frequency: 299.66253662109375,
    },
    {
        timestamp: 44445.463057220455,
        frequency: 299.66253662109375,
    },
    {
        timestamp: 44467.46313160705,
        frequency: 321.1784973144531,
    },
    {
        timestamp: 44485.46301907348,
        frequency: 321.1784973144531,
    },
    {
        timestamp: 44504.463072479244,
        frequency: 321.1784973144531,
    },
    {
        timestamp: 44523.463125885006,
        frequency: 321.1784973144531,
    },
    {
        timestamp: 44541.46301335144,
        frequency: 321.1784973144531,
    },
    {
        timestamp: 44564.463015258785,
        frequency: 304.02178955078125,
    },
    {
        timestamp: 44583.46306866455,
        frequency: 304.02178955078125,
    },
    {
        timestamp: 44601.46295613098,
        frequency: 304.02178955078125,
    },
    {
        timestamp: 44622.46310299682,
        frequency: 304.02178955078125,
    },
    {
        timestamp: 44641.94515640259,
        frequency: 304.02178955078125,
    },
    {
        timestamp: 44662.94506484985,
        frequency: 315.6951599121094,
    },
    {
        timestamp: 44683.9452117157,
        frequency: 315.6951599121094,
    },
    {
        timestamp: 44699.945005722046,
        frequency: 315.6951599121094,
    },
    {
        timestamp: 44719.94498664856,
        frequency: 315.6951599121094,
    },
    {
        timestamp: 44740.945133514404,
        frequency: 309.259765625,
    },
    {
        timestamp: 44759.945186920166,
        frequency: 309.259765625,
    },
    {
        timestamp: 44779.94516784668,
        frequency: 309.259765625,
    },
    {
        timestamp: 44797.94505531311,
        frequency: 309.259765625,
    },
    {
        timestamp: 44815.94518119812,
        frequency: 309.259765625,
    },
    {
        timestamp: 44838.94518310547,
        frequency: 313.9500732421875,
    },
    {
        timestamp: 44857.94499809265,
        frequency: 313.9500732421875,
    },
    {
        timestamp: 44877.945217437744,
        frequency: 313.9500732421875,
    },
    {
        timestamp: 44897.02503242493,
        frequency: 313.9500732421875,
    },
    {
        timestamp: 44914.02499237061,
        frequency: 313.9500732421875,
    },
    {
        timestamp: 44935.02513923645,
        frequency: 314.05218505859375,
    },
    {
        timestamp: 44954.02519264221,
        frequency: 314.05218505859375,
    },
    {
        timestamp: 44972.025080108644,
        frequency: 314.05218505859375,
    },
    {
        timestamp: 44991.025133514406,
        frequency: 314.05218505859375,
    },
    {
        timestamp: 45009.02502098084,
        frequency: 314.05218505859375,
    },
    {
        timestamp: 45031.02509536743,
        frequency: 308.8359375,
    },
    {
        timestamp: 45050.025148773195,
        frequency: 308.8359375,
    },
    {
        timestamp: 45067.02510871887,
        frequency: 308.8359375,
    },
    {
        timestamp: 45086.025162124635,
        frequency: 308.8359375,
    },
    {
        timestamp: 45104.025049591066,
        frequency: 308.8359375,
    },
    {
        timestamp: 45126.02512397766,
        frequency: 319.0039367675781,
    },
    {
        timestamp: 45144.940011444094,
        frequency: 319.0039367675781,
    },
    {
        timestamp: 45162.939898910525,
        frequency: 319.0039367675781,
    },
    {
        timestamp: 45182.93987983704,
        frequency: 319.0039367675781,
    },
    {
        timestamp: 45202.93986076355,
        frequency: 304.9331359863281,
    },
    {
        timestamp: 45221.939914169314,
        frequency: 304.9331359863281,
    },
    {
        timestamp: 45241.93989509583,
        frequency: 304.9331359863281,
    },
    {
        timestamp: 45259.94002098084,
        frequency: 304.9331359863281,
    },
    {
        timestamp: 45278.93983596802,
        frequency: 304.9331359863281,
    },
    {
        timestamp: 45301.93983787537,
        frequency: 318.9974060058594,
    },
    {
        timestamp: 45319.93996376038,
        frequency: 318.9974060058594,
    },
    {
        timestamp: 45338.94001716614,
        frequency: 318.9974060058594,
    },
    {
        timestamp: 45356.93990463257,
        frequency: 318.9974060058594,
    },
    {
        timestamp: 45374.94003051758,
        frequency: 318.9974060058594,
    },
    {
        timestamp: 45398.11103242493,
        frequency: 305.4793395996094,
    },
    {
        timestamp: 45416.11091989136,
        frequency: 305.4793395996094,
    },
    {
        timestamp: 45434.11104577637,
        frequency: 305.4793395996094,
    },
    {
        timestamp: 45454.111026702885,
        frequency: 305.4793395996094,
    },
    {
        timestamp: 45473.11084169007,
        frequency: 305.4793395996094,
    },
    {
        timestamp: 45497.11100953675,
        frequency: 316.4105224609375,
    },
    {
        timestamp: 45515.11089700318,
        frequency: 316.4105224609375,
    },
    {
        timestamp: 45535.11087792969,
        frequency: 316.4105224609375,
    },
    {
        timestamp: 45555.110858856206,
        frequency: 316.4105224609375,
    },
    {
        timestamp: 45578.110860763554,
        frequency: 306.968994140625,
    },
    {
        timestamp: 45596.110986648564,
        frequency: 306.968994140625,
    },
    {
        timestamp: 45615.111040054326,
        frequency: 306.968994140625,
    },
    {
        timestamp: 45635.20902098084,
        frequency: 306.968994140625,
    },
    {
        timestamp: 45654.20883596802,
        frequency: 306.968994140625,
    },
    {
        timestamp: 45675.208982833865,
        frequency: 304.8942565917969,
    },
    {
        timestamp: 45693.208870300296,
        frequency: 304.8942565917969,
    },
    {
        timestamp: 45712.20892370606,
        frequency: 304.8942565917969,
    },
    {
        timestamp: 45731.20897711182,
        frequency: 304.8942565917969,
    },
    {
        timestamp: 45750.20903051758,
        frequency: 304.8942565917969,
    },
    {
        timestamp: 45771.208938964846,
        frequency: 320.6745910644531,
    },
    {
        timestamp: 45789.20882643128,
        frequency: 320.6745910644531,
    },
    {
        timestamp: 45808.20887983704,
        frequency: 320.6745910644531,
    },
    {
        timestamp: 45827.2089332428,
        frequency: 320.6745910644531,
    },
    {
        timestamp: 45846.20898664856,
        frequency: 320.6745910644531,
    },
    {
        timestamp: 45867.20889509583,
        frequency: 301.1197509765625,
    },
    {
        timestamp: 45888.48704196166,
        frequency: 301.1197509765625,
    },
    {
        timestamp: 45907.486856948846,
        frequency: 301.1197509765625,
    },
    {
        timestamp: 45932.48695231628,
        frequency: 301.1197509765625,
    },
];

describe('detectVibrato', () => {
    it('should detect vibrato for the data provided', () => {
        expect(detectVibrato(data)).toEqual(true);
    });

    it('should not detect vibrato in a random records', () => {
        const records = generateFrequencyRecords([
            ...createDataSequence(300, 320, 2),
            ...createDataSequence(320, 310, 4),
            ...createDataSequence(310, 340, 4),
            ...createDataSequence(340, 350, 2),
            ...createDataSequence(350, 340, 2),
            ...createDataSequence(340, 380, 5),
        ]);

        expect(detectVibrato(records)).toEqual(false);
    });

    it('should not detect vibrato in just rising records', () => {
        const records = generateFrequencyRecords([
            ...createDataSequence(300, 310, 4),
            ...createDataSequence(310, 320, 4),
            ...createDataSequence(320, 330, 4),
            ...createDataSequence(330, 340, 4),
            ...createDataSequence(340, 350, 4),
            ...createDataSequence(350, 360, 4),
        ]);

        expect(detectVibrato(records)).toEqual(false);
    });

    it('should not detect vibrato in just falling records', () => {
        const records = generateFrequencyRecords([
            ...createDataSequence(360, 350, 4),
            ...createDataSequence(350, 340, 4),
            ...createDataSequence(340, 330, 4),
            ...createDataSequence(330, 320, 4),
            ...createDataSequence(320, 310, 4),
            ...createDataSequence(310, 300, 4),
        ]);

        expect(detectVibrato(records)).toEqual(false);
    });

    it('should not detect vibrato in an irregular vibrato-ey records', () => {
        const records = generateFrequencyRecords([
            ...createDataSequence(300, 310, 6),
            ...createDataSequence(310, 300, 2),
            ...createDataSequence(300, 310, 6),
            ...createDataSequence(310, 300, 2),
            ...createDataSequence(300, 310, 6),
            ...createDataSequence(310, 300, 2),
            ...createDataSequence(300, 310, 6),
            ...createDataSequence(310, 300, 2),
            ...createDataSequence(300, 310, 6),
            ...createDataSequence(310, 300, 2),
            ...createDataSequence(300, 310, 6),
            ...createDataSequence(310, 300, 2),
            ...createDataSequence(300, 310, 6),
            ...createDataSequence(310, 300, 2),
            ...createDataSequence(300, 310, 6),
            ...createDataSequence(310, 300, 2),
        ]);

        expect(detectVibrato(records)).toEqual(false);
    });

    it('should  detect vibrato in a vibrato-ey records', () => {
        const records = generateFrequencyRecords([
            ...createDataSequence(300, 310, 3),
            ...createDataSequence(310, 300, 3),
            ...createDataSequence(300, 310, 3),
            ...createDataSequence(310, 300, 3),
            ...createDataSequence(300, 310, 3),
            ...createDataSequence(310, 300, 3),
            ...createDataSequence(300, 310, 3),
            ...createDataSequence(310, 300, 3),
            ...createDataSequence(300, 310, 3),
            ...createDataSequence(310, 300, 3),
            ...createDataSequence(300, 310, 3),
            ...createDataSequence(310, 300, 3),
            ...createDataSequence(300, 310, 3),
            ...createDataSequence(310, 300, 3),
            ...createDataSequence(300, 310, 3),
            ...createDataSequence(310, 300, 3),
        ]);

        expect(detectVibrato(records)).toEqual(true);
    });
});
