import { createContext } from 'react';
import { Song } from '~/interfaces';
import { ConvertFormDerived } from '~/routes/convert/convert-form-context';

export const ConvertFormDerivedContext = createContext<ConvertFormDerived | null>(null);
export const ConvertFormFinalSongContext = createContext<Song | undefined>(undefined);
