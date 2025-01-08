import { act, renderHook } from '@testing-library/react';
import { SongPreview } from 'interfaces';
import { generateSongPreview } from 'modules/utils/testUtils';
import { useSongListFilter } from 'routes/SingASong/SongSelection/Hooks/useSongListFilter';
import { beforeEach } from 'vitest';

const list: SongPreview[] = [
  generateSongPreview([], { artist: 'diacritics characters', title: 'konik na biegunach', language: ['Polish'] }),
  generateSongPreview([], { artist: 'kombi', title: 'pokolenie', language: ['English'] }),
  generateSongPreview([], { artist: 'queen', title: "don't stop me now", language: ['Spanish'] }),
];

describe('useSongListFilter', () => {
  beforeEach(() => {
    global.location.search = '?playlist=All';
  });
  it('should return filtered list', () => {
    const { result } = renderHook(() => useSongListFilter(list, [], false, null));

    act(() => {
      result.current.setFilters({ search: 'koń' });
    });

    expect(result.current.filteredList).toContainEqual(list[0]);
    expect(result.current.filteredList).not.toContainEqual(list[1]);
    expect(result.current.filteredList).not.toContainEqual(list[2]);
  });

  it('should ignore lack of apostrophes and search through artist and title', () => {
    const { result } = renderHook(() => useSongListFilter(list, [], false, null));

    act(() => {
      result.current.setFilters({ search: 'queen dont' });
    });

    expect(result.current.filteredList).not.toContainEqual(list[0]);
    expect(result.current.filteredList).toContainEqual(list[2]);
  });

  it('should return all songs when search is empty', () => {
    const { result } = renderHook(() => useSongListFilter(list, [], false, null));

    act(() => {
      result.current.setFilters({ search: '          ' });
    });

    expect(result.current.filteredList).toEqual(list);
  });

  it('should include additional song even if the list does not contain it', () => {
    const { result } = renderHook(() => useSongListFilter(list, [], false, list[0].id));

    act(() => {
      result.current.setFilters({ language: 'Spanish' });
    });

    expect(result.current.filteredList).toContainEqual(list[2]);
    expect(result.current.filteredList).not.toContainEqual(list[1]);
    expect(result.current.filteredList).toContainEqual(list[0]);
  });
});
