import { useFormContext, useWatch } from 'react-hook-form';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import { useConvertFormDerivedContext } from '~/routes/convert/convert-form-context-hooks';

export default function useConvertStepState() {
  const { control } = useFormContext<ConvertFormValues>();
  const { isEdit } = useConvertFormDerivedContext();
  const txtInput = useWatch({ control, name: 'basicData.txtInput' });
  const videoUrl = useWatch({ control, name: 'authorAndVideo.video' });
  const editedSongVideoGap = useWatch({ control, name: 'editedSong.videoGap' });

  return {
    editedSongVideoGap,
    isAuthorAndVidCompleted: !!videoUrl,
    isBasicInfoCompleted: !!txtInput || isEdit,
  };
}
