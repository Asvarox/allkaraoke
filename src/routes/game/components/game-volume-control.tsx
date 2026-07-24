import { VolumeOff, VolumeUp } from '@mui/icons-material';
import Slider from '@mui/material/Slider';
import Typography from '~/modules/elements/akui/primitives/typography';

interface Props {
  volume: number;
  onChange: (volume: number) => void;
  onChangeCommitted?: (volume: number) => void;
}

const clampVolume = (volume: number) => Math.min(1, Math.max(0, volume));

const getSliderVolume = (value: number | number[]) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return clampVolume(rawValue / 100);
};

export default function GameVolumeControl({ volume, onChange, onChangeCommitted }: Props) {
  const safeVolume = clampVolume(volume);
  const Icon = safeVolume === 0 ? VolumeOff : VolumeUp;
  const percentage = Math.round(safeVolume * 100);

  return (
    <div
      className="shadow-focusable pointer-events-auto fixed right-4 bottom-4 z-20002 mr-4 flex h-48 flex-col items-center gap-3 rounded-md bg-black/75 px-3 py-3 text-white backdrop-blur-md"
      data-test="game-volume-control"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}>
      <Icon className="text-active h-6! w-6!" />

      <Slider
        aria-label="Game volume"
        data-test="game-volume-slider"
        max={100}
        min={0}
        onChange={(_, value) => {
          onChange(getSliderVolume(value));
        }}
        onChangeCommitted={(_, value) => {
          onChangeCommitted?.(getSliderVolume(value));
        }}
        orientation="vertical"
        step={1}
        value={percentage}
        sx={{
          color: 'orange',
          height: '7rem',
          '& .MuiSlider-rail': {
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
            opacity: 1,
          },
          '& .MuiSlider-thumb': {
            backgroundColor: 'white',
            border: '2px solid orange',
            height: '1rem',
            width: '1rem',
          },
          '& .MuiSlider-track': {
            border: 0,
          },
        }}
      />

      <Typography className="w-10 text-center text-sm">{percentage}%</Typography>
    </div>
  );
}
