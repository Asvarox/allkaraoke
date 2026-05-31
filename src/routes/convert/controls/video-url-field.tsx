import { Box, TextField } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import { useConvertFormFinalSongContext } from '~/routes/convert/convert-form-context-hooks';
import { inputAction } from '~/routes/convert/elements';

export default function VideoUrlField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const finalSong = useConvertFormFinalSongContext();
  const videoUrl = useWatch({ control, name: 'authorAndVideo.video' });
  const isSearchableForVideo = !!finalSong?.title && !!finalSong?.artist;

  const searchForVideo = () => {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(`${finalSong?.artist ?? ''} ${finalSong?.title ?? ''}`)}`,
      '_blank',
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2, alignItems: 'center', width: '100%' }}>
      <TextField
        data-test="video-url"
        required
        value={videoUrl ?? ''}
        onChange={(event) => setValue('authorAndVideo.video', event.target.value, { shouldDirty: true })}
        label="YouTube Video URL"
        placeholder="https://www.youtube.com/watch?v="
        fullWidth
        size="small"
        helperText="Link to YouTube video, eg https://www.youtube.com/watch?v=xxxxxxxxx. Click the 'Lookup' button to look for it on YouTube"
        name="videoUrl"
        {...inputAction(searchForVideo, isSearchableForVideo)}
      />
    </Box>
  );
}
