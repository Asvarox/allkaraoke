import { Box } from '@mui/material';
import SyncStep from '~/routes/convert/steps/sync-step';

interface Props {
  visible: boolean;
}

export default function SyncLyricsToVideo(props: Props) {
  return (
    <Box data-test="sync-lyrics">
      <SyncStep visible={props.visible} />
    </Box>
  );
}
