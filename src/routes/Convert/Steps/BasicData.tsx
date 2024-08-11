import { Box, Button, TextField } from '@mui/material';
import { Song } from 'interfaces';
import isNotesSection from 'modules/Songs/utils/isNotesSection';
import { ChangeEventHandler, useMemo } from 'react';
import { AuthorAndVidEntity } from 'routes/Convert/Steps/AuthorAndVideo';
import { fixDiacritics } from 'routes/Convert/Steps/utils/fixDiacritics';
import isValidUltrastarTxtFormat from 'routes/Convert/Steps/utils/validateUltrastar';
import importUltrastarEsSong from 'routes/Convert/importUltrastarEsSong';

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
            You don't need audio/video files, you'll be able to search for appropriate YouTube video and synchronise the
            lyrics to it in subsequent steps.
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
        <Box sx={{ display: 'flex', width: '100%', height: 500, overflow: 'auto' }}>
          {props.finalSong?.tracks?.map((track, index) => (
            <Box key={index} sx={{ flex: 1 }}>
              <h4 className="py-3">{track.name ?? `Track #${index + 1}`}</h4>
              {track.sections.filter(isNotesSection).map((section) => (
                <p key={section.start}>{section.notes.map((note) => note.lyrics).join('')}</p>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
