import selectRandomSong from 'Scenes/SingASong/SongSelectionVirtualized/Hooks/selectRandomSong';
import { randomInt } from 'utils/randomValue';
import { afterEach, Mock, vitest } from 'vitest';

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
  it('should select songs from previously selected list if the list contains all possible values and reset it', () => {
    (randomInt as Mock).mockReturnValue(0);
    const previouslySelectedValues = [0, 1, 2];

    expect(selectRandomSong(3, previouslySelectedValues, 3)).toEqual(0);
    expect(previouslySelectedValues).toContain(0);
    expect(previouslySelectedValues).toHaveLength(1);
  });

  afterEach(() => {
    vitest.resetAllMocks();
  });
});
