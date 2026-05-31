import { TextField } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

export default function AuthorField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const author = useWatch({ control, name: 'authorAndVideo.author' });

  return (
    <TextField
      data-test="author-name"
      sx={{ mt: 2 }}
      value={author}
      onChange={(event) => setValue('authorAndVideo.author', event.target.value, { shouldDirty: true })}
      label="Author name (optional)"
      fullWidth
      size="small"
      helperText="Nickname of the person that created the .txt file."
    />
  );
}
