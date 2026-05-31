import { Grid } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { getVideoId } from '~/modules/songs/utils/convert-txt-to-song';
import ArtistOriginField from '~/routes/convert/controls/artist-origin-field';
import PreviewRangeField from '~/routes/convert/controls/preview-range-field';
import RealBpmField from '~/routes/convert/controls/real-bpm-field';
import ReleaseYearField from '~/routes/convert/controls/release-year-field';
import SongArtistField from '~/routes/convert/controls/song-artist-field';
import SongEditionField from '~/routes/convert/controls/song-edition-field';
import SongGenreField from '~/routes/convert/controls/song-genre-field';
import SongLanguageField from '~/routes/convert/controls/song-language-field';
import SongTitleField from '~/routes/convert/controls/song-title-field';
import VolumeField from '~/routes/convert/controls/volume-field';
import { ConvertFormValues } from '~/routes/convert/convert-form-context';
import useConvertStepState from '~/routes/convert/hooks/use-convert-step-state';

export default function SongMetadataStep() {
  const { control } = useFormContext<ConvertFormValues>();
  const { editedSongVideoGap } = useConvertStepState();
  const authoredVideoUrl = useWatch({ control, name: 'authorAndVideo.video' });
  const editedSongVideoId = useWatch({ control, name: 'editedSong.video' });
  const committedSongVideoId = useWatch({ control, name: 'committedSong.video' });

  const videoId = getVideoId(authoredVideoUrl) || editedSongVideoId || committedSongVideoId || '';

  return (
    <Grid container spacing={2} data-test="song-metadata">
      <Grid item xs={6}>
        <SongArtistField />
      </Grid>
      <Grid item xs={6}>
        <SongTitleField />
      </Grid>
      <Grid item xs={3}>
        <SongGenreField />
      </Grid>
      <Grid item xs={3}>
        <SongEditionField />
      </Grid>
      <Grid item xs={3}>
        <SongLanguageField />
      </Grid>
      <Grid item xs={3}>
        <ArtistOriginField />
      </Grid>
      <Grid item xs={6}>
        <ReleaseYearField />
      </Grid>
      <Grid item xs={6}>
        <RealBpmField />
      </Grid>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <PreviewRangeField videoGap={editedSongVideoGap} videoId={videoId} />
      </Grid>
      <Grid item xs={12}>
        <VolumeField />
      </Grid>
    </Grid>
  );
}
