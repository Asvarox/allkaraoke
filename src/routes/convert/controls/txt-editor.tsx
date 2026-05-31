import { Box, Button, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import ApplyTxtWithDeltasDialog from '~/routes/convert/controls/apply-txt-with-deltas-dialog';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import { useConvertFormSync } from '~/routes/convert/hooks/use-convert-form-sync';
import { fixDiacritics } from '~/routes/convert/steps/utils/fix-diacritics';
import isValidUltrastarTxtFormat from '~/routes/convert/steps/utils/validate-ultrastar';

export default function TxtEditor() {
  const { control } = useFormContext<ConvertFormValues>();
  const { applyDraftTxt, draftDirty, hasPendingSyncDeltas, parseError, revertDraftTxt, setDraftTxt } =
    useConvertFormSync();
  const committedSong = useWatch({ control, name: 'committedSong' });
  const txtInput = useWatch({ control, name: 'basicData.txtInput' });
  const isValidTxt = useMemo(() => isValidUltrastarTxtFormat(txtInput), [txtInput]);
  const isTxtInputInvalid = (!!parseError || !isValidTxt) && txtInput.length > 0;
  const shouldShowApplyAndRevert = !!committedSong && draftDirty;
  const [showApplyWithDeltasDialog, setShowApplyWithDeltasDialog] = useState(false);

  const fixAccents = (language: string) => {
    setDraftTxt(fixDiacritics(txtInput, language));
  };

  return (
    <>
      <TextField
        error={isTxtInputInvalid}
        helperText={parseError ?? (isTxtInputInvalid ? "This doesn't look like a valid UltraStar .TXT format" : '')}
        required
        sx={{ mt: 2 }}
        fullWidth
        size="small"
        multiline
        label="Song's UltraStar .TXT file contents"
        onChange={(event) => setDraftTxt(event.target.value)}
        value={txtInput}
        maxRows={15}
        minRows={15}
        InputProps={{
          inputProps: {
            'aria-label': "Song's UltraStar .TXT file contents",
            'data-test': 'input-txt',
            sx: { fontFamily: 'monospace' },
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        {shouldShowApplyAndRevert && (
          <>
            <Button
              variant="contained"
              onClick={() => {
                if (hasPendingSyncDeltas) {
                  setShowApplyWithDeltasDialog(true);
                  return;
                }

                applyDraftTxt();
              }}
              data-test="apply-txt-button">
              Apply TXT
            </Button>
            <Button onClick={revertDraftTxt} data-test="revert-txt-button">
              Revert TXT
            </Button>
          </>
        )}
        <Button onClick={() => fixAccents('polish')}>Fix 🇵🇱 Polish accents</Button>
        <Button onClick={() => fixAccents('spanish')}>Fix 🇪🇸 Spanish accents</Button>
      </Box>
      <ApplyTxtWithDeltasDialog
        open={showApplyWithDeltasDialog}
        onCancel={() => setShowApplyWithDeltasDialog(false)}
        onConfirm={() => {
          applyDraftTxt({ withDeltas: true });
          setShowApplyWithDeltasDialog(false);
        }}
      />
    </>
  );
}
