import { TextField } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

export default function AuthorUrlField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const authorUrl = useWatch({ control, name: 'authorAndVideo.authorUrl' });

  return (
    <TextField
      data-test="author-url"
      sx={{ mt: 2 }}
      value={authorUrl}
      onChange={(event) => setValue('authorAndVideo.authorUrl', event.target.value, { shouldDirty: true })}
      label="Author URL (optional)"
      helperText="Link to authors page/profile."
      fullWidth
      size="small"
    />
  );
}
