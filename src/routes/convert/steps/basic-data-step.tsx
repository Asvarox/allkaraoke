import { Box, Button, ButtonGroup } from '@mui/material';
import { useState } from 'react';
import convertSongToTxt from '~/modules/songs/utils/convert-song-to-txt';
import isNotesSection from '~/modules/songs/utils/is-notes-section';
import { getSectionStartInMs } from '~/modules/songs/utils/notes-selectors';
import SourceUrlField from '~/routes/convert/controls/source-url-field';
import TxtEditor from '~/routes/convert/controls/txt-editor';
import { useConvertFormFinalSongContext } from '~/routes/convert/convert-form-context-hooks';
import { Pre } from '~/routes/convert/elements';
import formatMs from '~/routes/convert/steps/sync-lyrics-to-video/helpers/format-ms';

interface BasicDataStepProps {
  isTxtRequired: boolean;
}

export default function BasicDataStep({ isTxtRequired }: BasicDataStepProps) {
  const finalSong = useConvertFormFinalSongContext();
  const [selectedTrack, setSelectedTrack] = useState(0);

  if (!isTxtRequired && !finalSong) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }} data-test="basic-data">
      {isTxtRequired && (
        <div>
          <h4>Where to find songs?</h4>
          <p>
            Any UltraStar compatible .txt file will do. You can find many already made songs on{' '}
            <a href="https://usdb.animux.de/" target="_blank" rel="noreferrer">
              usdb.animux.de
            </a>
            {' or '}
            <a href="https://ultrastar-es.org/en" target="_blank" rel="noreferrer">
              ultrastar-es.org
            </a>
            .<br />
            <br />
          </p>
          <p>
            You don&#39;t need audio/video files, you&#39;ll be able to search for appropriate YouTube video and
            synchronise the lyrics to it in subsequent steps.
          </p>
        </div>
      )}
      <SourceUrlField />
      {isTxtRequired ? (
        <TxtEditor />
      ) : (
        <div className="flex w-full flex-col gap-2">
          {finalSong!.tracks.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-lg">Tracks: </span>
              <ButtonGroup variant={'contained'} sx={{ ml: 2 }} size={'small'}>
                {finalSong!.tracks.map((_, index) => (
                  <Button
                    key={index}
                    onClick={() => setSelectedTrack(index)}
                    disabled={selectedTrack === index}
                    data-test={`track-${index + 1}`}>
                    {finalSong!.tracks[index].name ?? `Track #${index + 1}`}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          )}
          <div className="flex h-150 w-full gap-1 overflow-auto">
            <div className="basis-1/2">
              <span className="text-md">Lyrics</span>
              <div className="mt-2">
                {finalSong!.tracks?.[selectedTrack].sections.filter(isNotesSection).map((section) => (
                  <p key={section.start}>
                    <span className="text-xs">
                      [<Pre>{formatMs(getSectionStartInMs(section, finalSong!))}</Pre>]
                    </span>{' '}
                    {section.notes.map((note) => note.lyrics).join('')}
                  </p>
                ))}
              </div>
            </div>
            <div className="basis-1/2 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-md">Original .txt file </span>
                <Button
                  variant="contained"
                  className="text-md"
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(convertSongToTxt(finalSong!));
                  }}>
                  Copy to clipboard
                </Button>
              </div>
              <Pre asChild className="mt-2 text-wrap">
                <pre>{convertSongToTxt(finalSong!)}</pre>
              </Pre>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
