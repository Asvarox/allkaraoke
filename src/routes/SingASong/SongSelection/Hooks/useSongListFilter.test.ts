import { act, renderHook } from '@testing-library/react';
import { SongPreview } from 'interfaces';
import { generateSongPreview } from 'modules/utils/testUtils';
import { useSongListFilter } from 'routes/SingASong/SongSelection/Hooks/useSongListFilter';
import { beforeEach } from 'vitest';

const list: SongPreview[] = [
  generateSongPreview([], { artist: 'diacritics characters', title: 'konik na biegunach' }),
  generateSongPreview([], { artist: 'kombi', title: 'pokolenie' }),
];

describe('useSongListFilter', () => {
  beforeEach(() => {
    global.location.search = '?playlist=All';
  });
  it('should return filtered list', () => {
    const { result } = renderHook(() => useSongListFilter(list, [], false));

    act(() => {
      result.current.setFilters({ search: 'koń' });
    });

    expect(result.current.filteredList[0]).toEqual(list[0]);
  });

  it('should return all songs when search is empty', () => {
    const { result } = renderHook(() => useSongListFilter(list, [], false));

    act(() => {
      result.current.setFilters({ search: '          ' });
    });

    expect(result.current.filteredList).toEqual(list);
  });
});
