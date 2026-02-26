import { Box, Button, ButtonGroup, TextField } from '@mui/material';
import { ChangeEventHandler, useMemo, useState } from 'react';
import { Song } from '~/interfaces';
import convertSongToTxt from '~/modules/Songs/utils/convertSongToTxt';
import isNotesSection from '~/modules/Songs/utils/isNotesSection';
import { getSectionStartInMs } from '~/modules/Songs/utils/notesSelectors';
import importUltrastarEsSong from '~/routes/Convert/importUltrastarEsSong';
import { AuthorAndVidEntity } from '~/routes/Convert/Steps/AuthorAndVideo';
import formatMs from '~/routes/Convert/Steps/SyncLyricsToVideo/Helpers/formatMs';
import { fixDiacritics } from '~/routes/Convert/Steps/utils/fixDiacritics';
import isValidUltrastarTxtFormat from '~/routes/Convert/Steps/utils/validateUltrastar';
import { Pre } from '../Elements';

export interface BasicDataEntity {
  sourceUrl: string;
  txtInput: string;
}

interface Props {
  shouldAutoImport: boolean;
  onAutoImport: (data: AuthorAndVidEntity) => void;
  onChange: (data: BasicDataEntity) => void;
  data: BasicDataEntity;
  isTxtRequired: boolean;
  finalSong: Song;
}

export default function BasicData(props: Props) {
  const onSourceUrlEdit: ChangeEventHandler<HTMLInputElement> = async (e) => {
    props.onChange({ ...props.data, sourceUrl: e.target.value });
    if (props.shouldAutoImport) {
      const data = await importUltrastarEsSong(e.target.value);

      if (data) props.onAutoImport(data);
    }
  };

  const fixAccents = (language: string) => {
    props.onChange({
      ...props.data,
      txtInput: fixDiacritics(props.data.txtInput, language),
    });
  };

  const isValidTxt = useMemo(() => isValidUltrastarTxtFormat(props.data.txtInput), [props.data.txtInput]);

  const isTxtInputValid = !isValidTxt && props.data.txtInput.length > 0;

  const [selectedTrack, setSelectedTrack] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }} data-test="basic-data">
      {props.isTxtRequired && (
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
      <TextField
        sx={{ mt: 2 }}
        value={props.data.sourceUrl}
        onChange={onSourceUrlEdit}
        label="Source URL (optional)"
        fullWidth
        size="small"
        data-test="source-url"
        helperText="The link to the page from which the .TXT file was downloaded."
      />
      {props.isTxtRequired ? (
        <>
          <TextField
            error={isTxtInputValid}
            helperText={isTxtInputValid ? "This doesn't look like a valid UltraStar .TXT format" : ''}
            required
            sx={{ mt: 2 }}
            fullWidth
            size="small"
            multiline
            label="Song's UltraStar .TXT file contents"
            onChange={(e) =>
              props.onChange({
                ...props.data,
                txtInput: e.target.value,
              })
            }
            value={props.data.txtInput}
            maxRows={15}
            minRows={15}
            InputProps={{
              inputProps: {
                'data-test': 'input-txt',
                sx: { fontFamily: 'monospace' },
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button onClick={() => fixAccents('polish')}>Fix 🇵🇱 Polish accents</Button>
            <Button onClick={() => fixAccents('spanish')}>Fix 🇪🇸 Spanish accents</Button>
          </Box>
        </>
      ) : (
        <div className="flex w-full flex-col gap-2">
          {props.finalSong.tracks.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-lg">Tracks: </span>
              <ButtonGroup variant={'contained'} sx={{ ml: 2 }} size={'small'}>
                {props.finalSong.tracks.map((_, index) => (
                  <Button
                    key={index}
                    onClick={() => setSelectedTrack(index)}
                    disabled={selectedTrack === index}
                    data-test={`track-${index + 1}`}>
                    {props.finalSong.tracks[index].name ?? `Track #${index + 1}`}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          )}
          <div className="flex h-150 w-full gap-1 overflow-auto">
            <div className="basis-1/2">
              <span className="text-md">Lyrics</span>
              <div className="mt-2">
                {props.finalSong?.tracks?.[selectedTrack].sections.filter(isNotesSection).map((section) => (
                  <p key={section.start}>
                    <span className="text-xs">
                      [<Pre>{formatMs(getSectionStartInMs(section, props.finalSong))}</Pre>]
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
                    navigator.clipboard.writeText(convertSongToTxt(props.finalSong));
                  }}>
                  Copy to clipboard
                </Button>
              </div>
              <Pre asChild className="mt-2 text-wrap">
                <pre>{convertSongToTxt(props.finalSong)}</pre>
              </Pre>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
