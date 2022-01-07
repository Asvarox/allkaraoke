import { calcDistanceBetweenPitches } from "./calcDistance";

describe('calcDistanceBetweenPitches', () => {
    it.each([
        [-2, 0, -2],
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 2],
        [-6, 0, -6],
        [24, 12, 0],
        [22, 12, -2],
        [14, 12, 2],
    ])('should on comparing %p against %p return %p', (detectedPitch, targetPitch, expectedDistance) => {
        expect(calcDistanceBetweenPitches(detectedPitch, targetPitch)).toEqual(expectedDistance);
    });
});