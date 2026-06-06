import { TextField } from '@mui/material';
import { ChangeEventHandler, useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import importSongFromSource from '~/routes/convert/import-ultrastar-es-song';

export default function SourceUrlField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const sourceUrl = useWatch({ control, name: 'basicData.sourceUrl' });
  const videoUrl = useWatch({ control, name: 'authorAndVideo.video' });
  const latestRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      latestRequestIdRef.current += 1;
    };
  }, []);

  const onSourceUrlEdit: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const nextSourceUrl = event.target.value;
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    setValue('basicData.sourceUrl', nextSourceUrl, { shouldDirty: true });

    if (videoUrl) {
      return;
    }

    try {
      const importedSong = await importSongFromSource(nextSourceUrl);

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      if (importedSong) {
        setValue('authorAndVideo', importedSong, { shouldDirty: true });
      }
    } catch (error) {
      if (requestId === latestRequestIdRef.current) {
        console.error('Failed to import song metadata from source URL', error);
      }
    }
  };

  return (
    <TextField
      sx={{ mt: 2 }}
      value={sourceUrl ?? ''}
      onChange={onSourceUrlEdit}
      label="Source URL (optional)"
      fullWidth
      size="small"
      data-test="source-url"
      helperText="The link to the page from which the .TXT file was downloaded."
    />
  );
}
