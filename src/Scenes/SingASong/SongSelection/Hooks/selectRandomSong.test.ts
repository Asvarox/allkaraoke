import { randomInt } from 'utils/randomValue';
import { Mock, vitest } from 'vitest';
import { expect } from '@playwright/test';
import selectRandomSong from 'Scenes/SingASong/SongSelection/Hooks/selectRandomSong';

vitest.mock('utils/randomValue');

describe('selectRandomSong', function () {
    it('should not select songs from previously selected list and add new value to the list', () => {
        (randomInt as Mock).mockReturnValueOnce(0);
        (randomInt as Mock).mockReturnValueOnce(1);
        (randomInt as Mock).mockReturnValueOnce(2);

        const previouslySelectedValues = [0, 1];

        expect(selectRandomSong(3, previouslySelectedValues, 2)).toEqual(2);
        expect(previouslySelectedValues).toContain(2);
        expect(previouslySelectedValues).not.toContain(0);
    });
});
