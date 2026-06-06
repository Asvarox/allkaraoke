import { Box } from '@mui/material';
import AuthorField from '~/routes/convert/controls/author-field';
import AuthorUrlField from '~/routes/convert/controls/author-url-field';
import VideoIdPreview from '~/routes/convert/controls/video-id-preview';
import VideoUrlField from '~/routes/convert/controls/video-url-field';

export default function AuthorAndVideoStep() {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }} data-test="author-and-vid">
      <AuthorField />
      <AuthorUrlField />
      <VideoUrlField />
      <VideoIdPreview />
    </Box>
  );
}
