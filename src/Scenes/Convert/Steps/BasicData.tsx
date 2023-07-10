import { Box, FormControlLabel, Switch, TextField } from '@mui/material';
import { AuthorAndVidEntity } from 'Scenes/Convert/Steps/AuthorAndVid';
import importUltrastarEsSong from 'Scenes/Convert/importUltrastarEsSong';
import { ChangeEventHandler } from 'react';
import createPersistedState from 'use-persisted-state';

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
}

const useFixDiacritics = createPersistedState<boolean>('editSongFixDiacritics', sessionStorage);

export default function BasicData(props: Props) {
    const onSourceUrlEdit: ChangeEventHandler<HTMLInputElement> = async (e) => {
        props.onChange({ ...props.data, sourceUrl: e.target.value });
        if (props.shouldAutoImport) {
            const data = await importUltrastarEsSong(e.target.value);

            if (data) props.onAutoImport(data);
        }
    };

    const [attemptFixDiacritics, setAttemptFixDiacritics] = useFixDiacritics(true);

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
                        You don't need audio/video files, you'll be able to search for appropriate YouTube video and
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
            {props.isTxtRequired && (
                <>
                    <TextField
                        required
                        sx={{ mt: 2 }}
                        fullWidth
                        size="small"
                        multiline
                        label="Song's UltraStar .TXT file contents"
                        onChange={(e) =>
                            props.onChange({
                                ...props.data,
                                txtInput: attemptFixDiacritics ? fixDiacritics(e.target.value) : e.target.value,
                            })
                        }
                        value={props.data.txtInput}
                        maxRows={15}
                        minRows={15}
                        InputProps={{
                            inputProps: {
                                'data-test': 'input-txt',
                            },
                        }}
                    />
                    <FormControlLabel
                        checked={attemptFixDiacritics}
                        control={<Switch />}
                        label="Fix polish diacritic characters"
                        onChange={(_, checked) => setAttemptFixDiacritics(checked)}
                    />
                </>
            )}
        </Box>
    );
}

function fixDiacritics(txt: string): string {
    return txt
        .replaceAll('È', 'é')
        .replaceAll('í', "'")
        .replaceAll('¥', "'")

        .replaceAll('¯', 'Ż')
        .replaceAll('¹', 'ą')
        .replaceAll('π', 'ą')
        .replaceAll('ê', 'ę')
        .replaceAll('Í', 'ę')
        .replaceAll('Œ', 'Ś')
        .replaceAll('å', 'Ś')
        .replaceAll('œ', 'ś')
        .replaceAll('ú', 'ś')
        .replaceAll('æ', 'ć')
        .replaceAll('Ê', 'ć')
        .replaceAll('¿', 'ż')
        .replaceAll('ø', 'ż')
        .replaceAll('Ø', 'Ż')
        .replaceAll('ñ', 'ń')
        .replaceAll('Ò', 'ń')
        .replaceAll('³', 'ł')
        .replaceAll('≥', 'ł')
        .replaceAll('≥', 'ł')
        .replaceAll('£', 'Ł')
        .replaceAll('Û', 'ó')
        .replaceAll('ü', 'ź')
        .replaceAll('Ÿ', 'ź');
}
