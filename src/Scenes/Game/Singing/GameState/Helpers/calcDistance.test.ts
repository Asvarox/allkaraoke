import { calcDistanceBetweenPitches } from './calcDistance';

describe('calcDistanceBetweenPitches', () => {
  it.each`
    detectedPitch | targetPitch    | tolerance | expectedDistance
    ${7}          | ${-3 * 12}     | ${2}      | ${-5}
    ${5}          | ${-3 * 12}     | ${2}      | ${5}
    ${-3}         | ${0}           | ${2}      | ${-3}
    ${0}          | ${0}           | ${2}      | ${0}
    ${1}          | ${0}           | ${2}      | ${0}
    ${3}          | ${0}           | ${2}      | ${3}
    ${-6}         | ${0}           | ${2}      | ${-6}
    ${24}         | ${12}          | ${2}      | ${0}
    ${21}         | ${12}          | ${2}      | ${-3}
    ${5}          | ${12 * 15 + 9} | ${2}      | ${-4}
    ${5}          | ${12 * 3 + 9}  | ${2}      | ${-4}
    ${12 * 3 + 9} | ${5}           | ${2}      | ${4}
    ${15}         | ${12}          | ${2}      | ${3}
    ${48}         | ${71}          | ${0}      | ${1}
    ${48}         | ${73}          | ${0}      | ${-1}
    ${47}         | ${71}          | ${0}      | ${0}
    ${35}         | ${69}          | ${0}      | ${2}
  `('should on comparing %p against %p return %p', ({ detectedPitch, targetPitch, tolerance, expectedDistance }) => {
    expect(calcDistanceBetweenPitches(detectedPitch, targetPitch, tolerance)).toEqual(expectedDistance);
  });
});
