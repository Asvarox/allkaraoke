import { Slider } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';

export default function VolumeField() {
  const { control, setValue } = useFormContext<ConvertFormValues>();
  const volume = useWatch({ control, name: 'metadata.volume' });
  const sliderValue = volume === undefined || volume === 0 ? 0.7 : volume;

  return (
    <>
      <h5>Final Song Volume ({Math.round(sliderValue * 100)})</h5>
      <div className="px-5">
        <Slider
          data-test="volume"
          min={0.1}
          max={1}
          step={0.01}
          aria-label="Volume"
          value={sliderValue}
          onChange={(_event, value) => setValue('metadata.volume', Number(value), { shouldDirty: true })}
        />
      </div>
    </>
  );
}
