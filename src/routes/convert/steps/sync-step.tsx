import { Box } from '@mui/material';
import SyncEditor from '~/routes/convert/controls/sync-editor';
import { useConvertFormDerivedContext } from '~/routes/convert/convert-form-context-hooks';

interface SyncStepProps {
  visible: boolean;
}

export default function SyncStep({ visible }: SyncStepProps) {
  const { conversionResult } = useConvertFormDerivedContext();

  return (
    <Box>
      {conversionResult && conversionResult.video.length < 15 && !!conversionResult.tracks?.[0]?.sections?.length && (
        <SyncEditor song={conversionResult} visible={visible} />
      )}
    </Box>
  );
}
