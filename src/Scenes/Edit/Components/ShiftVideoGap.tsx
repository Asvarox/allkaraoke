import { Box, Button, ButtonGroup, TextField, Typography } from '@mui/material';
import { PlayerRef } from '../../Game/Singing/Player';
import { msec } from '../Helpers/formatMs';

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
                    <Button sx={{ flex: 1, px: 1.25 }} onClick={() => onChange(current - 10)}>
                        -10
                    </Button>
                    <Button sx={{ flex: 1, px: 1.25 }} onClick={() => onChange(current - 5)}>
                        -5
                    </Button>
                    <Button sx={{ flex: 1, px: 1.25 }} onClick={() => onChange(current - 1)}>
                        -1
                    </Button>
                </ButtonGroup>
                <TextField
                    sx={{ py: 0, flex: 1 }}
                    size={'small'}
                    type="text"
                    value={current}
                    onChange={(e) => onChange(+e.target.value)}
                    label="Seconds"
                    // helperText={}
                />
                <ButtonGroup sx={{ flex: 1 }}>
                    <Button sx={{ flex: 1, px: 1.25 }} onClick={() => onChange(current + 1)}>
                        +1
                    </Button>
                    <Button sx={{ flex: 1, px: 1.25 }} onClick={() => onChange(current + 5)}>
                        +5
                    </Button>
                    <Button sx={{ flex: 1, px: 1.25 }} onClick={() => onChange(current + 10)}>
                        +10
                    </Button>
                </ButtonGroup>
            </Box>
        </Box>
    );
}
