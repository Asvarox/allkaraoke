import { Box } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import YouTube from 'react-youtube';
import { getVideoId } from '~/modules/songs/utils/convert-txt-to-song';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

export default function VideoIdPreview() {
  const { control } = useFormContext<ConvertFormValues>();
  const videoUrl = useWatch({ control, name: 'authorAndVideo.video' });
  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return null;
  }

  return (
    <Box>
      <YouTube videoId={videoId} />
    </Box>
  );
}
