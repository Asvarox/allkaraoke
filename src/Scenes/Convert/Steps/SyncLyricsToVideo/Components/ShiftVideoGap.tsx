import { Box, Button, ButtonGroup, TextField, Typography } from '@mui/material';
import { msec } from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/formatMs';
import { PlayerRef } from 'Scenes/Game/Singing/Player';

interface Props {
    onChange: (shift: number) => void;
    current: number;
    player: PlayerRef;
    finalGap: number | undefined;
}

export default function ShiftVideoGap({ current, onChange, player, finalGap }: Props) {
    return (
        <Box sx={{ flex: 1 }}>
            <Typography variant={'h6'}>Video Gap shift (final: {msec((finalGap ?? 0) * 1000, player)})</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <ButtonGroup sx={{ flex: 1 }}>
                    <Button
                        sx={{ flex: 1, px: 1.25 }}
                        onClick={() => onChange(current - 10)}
                        data-test="shift-video-gap-10s">
                        -10
                    </Button>
                    <Button
                        sx={{ flex: 1, px: 1.25 }}
                        onClick={() => onChange(current - 5)}
                        data-test="shift-video-gap-5s">
                        -5
                    </Button>
                    <Button
                        sx={{ flex: 1, px: 1.25 }}
                        onClick={() => onChange(current - 1)}
                        data-test="shift-video-gap-1s">
                        -1
                    </Button>
                </ButtonGroup>
                <TextField
                    data-test="shift-video-gap"
                    sx={{ py: 0, flex: 1 }}
                    size={'small'}
                    type="text"
                    value={current}
                    onChange={(e) => onChange(+e.target.value)}
                    label="Seconds"
                    // helperText={}
                />
                <ButtonGroup sx={{ flex: 1 }}>
                    <Button
                        sx={{ flex: 1, px: 1.25 }}
                        onClick={() => onChange(current + 1)}
                        data-test="shift-video-gap+1s">
                        +1
                    </Button>
                    <Button
                        sx={{ flex: 1, px: 1.25 }}
                        onClick={() => onChange(current + 5)}
                        data-test="shift-video-gap+5s">
                        +5
                    </Button>
                    <Button
                        sx={{ flex: 1, px: 1.25 }}
                        onClick={() => onChange(current + 10)}
                        data-test="shift-video-gap+10s">
                        +10
                    </Button>
                </ButtonGroup>
            </Box>
        </Box>
    );
}
