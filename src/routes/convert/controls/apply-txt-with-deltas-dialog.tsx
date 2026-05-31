import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ApplyTxtWithDeltasDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

export default function ApplyTxtWithDeltasDialog({ open, onCancel, onConfirm }: ApplyTxtWithDeltasDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Apply TXT with active sync edits</DialogTitle>
      <DialogContent>
        <DialogContentText>You have active sync deltas. Apply deltas into TXT and reset deltas?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" data-test="confirm-apply-txt-with-deltas">
          Apply deltas into TXT and reset deltas
        </Button>
      </DialogActions>
    </Dialog>
  );
}
