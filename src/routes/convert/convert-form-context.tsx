import { PropsWithChildren } from 'react';
import { Song, SongPreview } from '~/interfaces';
import { ConvertFormDerivedContext, ConvertFormFinalSongContext } from '~/routes/convert/convert-form-context-internal';
import { ChangeRecord } from '~/routes/convert/steps/sync-lyrics-to-video/components/edit-section';

export interface BasicDataEntity {
  sourceUrl: string;
  txtInput: string;
}

export interface AuthorAndVidEntity {
  author: string;
  authorUrl: string;
  video: string;
}

export interface SongMetadataEntity {
  artist: string;
  title: string;
  year: string;
  language: string[];
  edition: string | undefined;
  genre: string | undefined;
  artistOrigin: string | undefined;
  realBpm: string;
  volume: number;
  previewStart: number | undefined;
  previewEnd: number | undefined;
}

export type SyncLyricChanges = Record<number, Record<number, Record<number, string>>>;

export interface ConvertFormValues {
  basicData: BasicDataEntity;
  authorAndVideo: AuthorAndVidEntity;
  committedSong: Song | undefined;
  metadata: SongMetadataEntity;
  editedSong: Song | undefined;
  sync: {
    changeRecords: ChangeRecord[];
    gapShift: string;
    lyricChanges: SyncLyricChanges;
    overrideBpm: number;
    trackNames: (string | undefined)[];
    videoGapShift: number;
  };
  txt: {
    canonical: string;
    draftDirty: boolean;
    parseError: string | undefined;
  };
}

export interface ConvertFormDerived {
  conversionResult: Song | undefined;
  duplicateCandidate: SongPreview | undefined;
  isEdit: boolean;
}

interface ConvertFormDerivedContextProviderProps extends PropsWithChildren {
  value: ConvertFormDerived;
}

interface ConvertFormFinalSongContextProviderProps extends PropsWithChildren {
  value: Song | undefined;
}

export function ConvertFormDerivedContextProvider({ children, value }: ConvertFormDerivedContextProviderProps) {
  return <ConvertFormDerivedContext.Provider value={value}>{children}</ConvertFormDerivedContext.Provider>;
}

export function ConvertFormFinalSongContextProvider({ children, value }: ConvertFormFinalSongContextProviderProps) {
  return <ConvertFormFinalSongContext.Provider value={value}>{children}</ConvertFormFinalSongContext.Provider>;
}
