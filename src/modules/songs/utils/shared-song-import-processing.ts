import { Song } from '~/interfaces';

import getSongId from './get-song-id';

const ESC_TITLE_SUFFIX_REGEX = /\s*\(ESC\s+(\d+)\s+[^)]+\)\s*$/i;
const REMOVABLE_TITLE_SUFFIXES = [
  'tv',
  'album version',
  'movie version',
  'duet',
  'radio mix',
  'original mix',
  'movie ver.',
  'tv size',
  'lyrics',
  'lyrics video',
  'official music video',
];
const REMOVABLE_TITLE_SUFFIX_REGEX = new RegExp(
  `\\s*[(\\[]\\s*(?:${REMOVABLE_TITLE_SUFFIXES.map((suffix) => suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s*[)\\]]\\s*$`,
  'i',
);

const LANGUAGE_NAMES = new Intl.DisplayNames('en', { type: 'language' });

export const FALLBACK_VIDEO_DURATION_SECONDS = 20 * 60;

export function normalizeSharedSongTxt(songTxt: string): string {
  return songTxt.replaceAll('\\n', '\n');
}

export function applyEscEditionFromTitle(song: Song): void {
  const titleSuffixMatch = song.title.match(ESC_TITLE_SUFFIX_REGEX);
  if (!titleSuffixMatch) {
    return;
  }

  const [, editionYear] = titleSuffixMatch;
  song.title = song.title.replace(ESC_TITLE_SUFFIX_REGEX, '').trim();
  song.edition = `ESC ${editionYear}`;
}

export function normalizeLegacyMetadata(song: Song): void {
  // Loop to also strip stacked suffixes, e.g. "Song (Lyrics) (TV)"
  let previousTitle: string;
  do {
    previousTitle = song.title;
    song.title = song.title.replace(REMOVABLE_TITLE_SUFFIX_REGEX, '').trim();
  } while (song.title !== previousTitle);

  song.language = song.language.map((rawLanguage) => {
    // Strip stray separators, e.g. "English,"
    const language = rawLanguage.trim().replace(/^[,;\s]+|[,;\s]+$/g, '');
    // Two-letter ISO codes, e.g. "en" -> "English"
    if (/^[a-z]{2}$/i.test(language)) {
      return LANGUAGE_NAMES.of(language.toLowerCase()) ?? language;
    }
    if (language.toLowerCase().startsWith('espa')) {
      return 'Spanish';
    }
    if (language.toLowerCase().endsWith('(romanized)')) {
      return language.slice(0, -11).trim();
    }
    if (language.toLowerCase().endsWith('(brazil)')) {
      return 'Portuguese';
    }

    return language;
  });

  // North K -> South Korea fix
  song.artistOrigin = song.artistOrigin?.toLowerCase() === 'kp' ? 'KR' : song.artistOrigin;
}

export function normalizeSongLyricsQuotes(song: Song): void {
  song.tracks.forEach((track) => {
    track.sections.forEach((section) => {
      if ('notes' in section) {
        section.notes.forEach((note) => {
          note.lyrics = note.lyrics?.replaceAll(/\\+"/g, '"');
        });
      }
    });
  });
}

export function applyCommonSharedSongImportProcessing(song: Song): void {
  normalizeLegacyMetadata(song);
  applyEscEditionFromTitle(song);
  // ESC suffix may have hidden another one, e.g. "Song (TV) (ESC 2025 Germany)"
  normalizeLegacyMetadata(song);
  normalizeSongLyricsQuotes(song);

  song.id = getSongId({ artist: song.artist, title: song.title });
}

export function getLyricsEndTimeMs(song: Song): number {
  const beatLengthMs = (60 / song.bpm / (song.bar ?? 4)) * 1000;
  let lastLyricsBeatEnd = 0;

  for (const track of song.tracks) {
    for (const section of track.sections) {
      if (section.type !== 'notes') {
        continue;
      }

      for (const note of section.notes) {
        const noteEnd = note.start + note.length;
        if (noteEnd > lastLyricsBeatEnd) {
          lastLyricsBeatEnd = noteEnd;
        }
      }
    }
  }

  return lastLyricsBeatEnd * beatLengthMs + song.gap;
}

export function lyricsFitWithinVideoDuration(song: Song, videoDurationSeconds: number): boolean {
  if (!Number.isFinite(videoDurationSeconds) || videoDurationSeconds <= 0) {
    return false;
  }

  const lyricsEndMs = getLyricsEndTimeMs(song);
  return lyricsEndMs <= videoDurationSeconds * 1000;
}
