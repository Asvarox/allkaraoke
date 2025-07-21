import { Alert, AlertTitle, Button, Grid, Paper, Step, StepButton, StyledEngineProvider } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import { Song } from 'interfaces';
import { useBackground } from 'modules/Elements/BackgroundContext';
import NormalizeFontSize from 'modules/Elements/NormalizeFontSize';
import SongDao from 'modules/Songs/SongsService';
import useSongIndex from 'modules/Songs/hooks/useSongIndex';
import convertTxtToSong, { getVideoId } from 'modules/Songs/utils/convertTxtToSong';
import getSongId from 'modules/Songs/utils/getSongId';
import useBackgroundMusic from 'modules/hooks/useBackgroundMusic';
import useQueryParam from 'modules/hooks/useQueryParam';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import setQueryParam from 'modules/utils/setQueryParam';
import { useEffect, useMemo, useState } from 'react';
import AuthorAndVideo, { AuthorAndVidEntity } from 'routes/Convert/Steps/AuthorAndVideo';
import BasicData, { BasicDataEntity } from 'routes/Convert/Steps/BasicData';
import SongMetadata, { SongMetadataEntity } from 'routes/Convert/Steps/SongMetadata';
import SyncLyricsToVideo from 'routes/Convert/Steps/SyncLyricsToVideo';
import { shareSong } from 'routes/Edit/ShareSongsModal';
import { ValuesType } from 'utility-types';
import { Link } from 'wouter';

interface Props {
  song?: Song;
}

function isEmptyValue<T>(v: T | T[] | undefined) {
  return Array.isArray(v) ? v.length === 0 : !v;
}

const steps = ['basic-data', 'author-and-video', 'sync', 'metadata'] as const;

export default function ConvertView({ song }: Props) {
  const isEdit = !!song;
  const { data: songs } = useSongIndex(true);
  useBackground(false);
  const navigate = useSmoothNavigate();
  useBackgroundMusic(false);
  const initialStep = useQueryParam('step') as ValuesType<typeof steps> | null;
  const [currentStep, setCurrentStep] = useState(Math.max(0, steps.indexOf(initialStep!)));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (steps[currentStep]) {
      setQueryParam({ step: steps[currentStep] });
    }
  }, [currentStep]);

  const [basicData, setBasicData] = useState<BasicDataEntity>({ sourceUrl: song?.sourceUrl ?? '', txtInput: '' });
  const [authorAndVid, setAuthorAndVid] = useState<AuthorAndVidEntity>({
    author: song?.author ?? '',
    authorUrl: song?.authorUrl ?? '',
    video: song?.video ? `https://www.youtube.com/watch?v=${song.video}` : '',
  });
  const [metadataEntity, setMetadataEntity] = useState<SongMetadataEntity>({
    artist: song?.artist ?? '',
    title: song?.title ?? '',
    realBpm: song?.realBpm ? String(song.realBpm) : '',
    year: song?.year ?? '',
    language: song?.language ?? [],
    volume: song?.volume ?? 0,
    previewStart: song?.previewStart ?? undefined,
    previewEnd: song?.previewEnd ?? undefined,
    genre: song?.genre,
    edition: song?.edition,
    artistOrigin: song?.artistOrigin,
  });

  const [editedSong, setEditedSong] = useState<Song | undefined>(song);

  const conversionResult: Song | undefined = useMemo(() => {
    try {
      if (isEdit)
        return {
          ...song,
          video: getVideoId(authorAndVid.video) || song.video,
          author: authorAndVid.author,
          authorUrl: authorAndVid.authorUrl,
          sourceUrl: basicData.sourceUrl,
        };
      if (!basicData.txtInput) return undefined;
      const result = convertTxtToSong(
        basicData.txtInput,
        authorAndVid.video,
        authorAndVid.author,
        authorAndVid.authorUrl,
        basicData.sourceUrl,
      );

      return result;
    } catch (e: any) {
      console.error(e);
    }
    return undefined;
  }, [
    basicData.txtInput,
    authorAndVid.video,
    authorAndVid.author,
    authorAndVid.authorUrl,
    basicData.sourceUrl,
    song,
    isEdit,
  ]);

  const possibleDuplicate = useMemo(
    () =>
      !isEdit &&
      conversionResult &&
      songs?.find((addedSong) => SongDao.generateSongFile(addedSong) === SongDao.generateSongFile(conversionResult)),
    [songs, conversionResult, isEdit],
  );

  useEffect(() => {
    if (conversionResult) {
      if (!!conversionResult.video && !authorAndVid.video) {
        setAuthorAndVid((current) => ({
          ...current,
          video: `https://www.youtube.com/watch?v=${conversionResult.video}`,
        }));
      }
      if (!!conversionResult.author && !authorAndVid.author) {
        setAuthorAndVid((current) => ({
          ...current,
          author: current.author || conversionResult?.author || '',
          authorUrl: current.authorUrl || conversionResult?.authorUrl || '',
        }));
      }
      if (!!conversionResult.sourceUrl && !basicData.sourceUrl) {
        setBasicData((current) => ({
          ...current,
          sourceUrl: conversionResult.sourceUrl!,
        }));
      }
      (
        [
          'year',
          'language',
          'realBpm',
          'genre',
          'artist',
          'title',
          'volume',
          'previewStart',
          'previewEnd',
          'artistOrigin',
        ] as const
      ).forEach((property) => {
        if (!!conversionResult[property] && isEmptyValue(metadataEntity[property])) {
          setMetadataEntity((current) => ({
            ...current,
            [property]: conversionResult[property],
          }));
        }
      });
    }
  }, [
    conversionResult,
    metadataEntity.year,
    metadataEntity.language,
    metadataEntity.realBpm,
    metadataEntity.genre,
    metadataEntity.artist,
    metadataEntity.volume,
    metadataEntity.title,
    metadataEntity.previewStart,
    metadataEntity.previewEnd,
    basicData.sourceUrl,
    authorAndVid.video,
  ]);

  const isBasicInfoCompleted = !!basicData.txtInput || isEdit;
  const isAuthorAndVidCompleted = !!authorAndVid.video;

  const isNextStepAvailable = steps[currentStep] === 'author-and-video' ? isAuthorAndVidCompleted : true;

  const finalSong: Song = {
    ...editedSong!,
    ...metadataEntity,
    author: authorAndVid.author,
    authorUrl: authorAndVid.authorUrl,
    realBpm: +metadataEntity.realBpm,
    sourceUrl: basicData.sourceUrl,
    id: getSongId(metadataEntity),
  };

  return (
    <StyledEngineProvider injectFirst>
      <NormalizeFontSize />
      <Grid container gap={2} p={1} pb={10}>
        <Grid item xs={12}>
          {!isEdit && (
            <div style={{ marginBottom: '1rem' }}>
              <Link to="menu/">
                <a>Return to the main menu</a>
              </Link>
            </div>
          )}
        </Grid>
        <Grid item xs={12}>
          <Stepper activeStep={currentStep} sx={{ mb: 2 }} nonLinear={isEdit}>
            <Step key={0} completed={isBasicInfoCompleted}>
              <StepButton color="inherit" onClick={() => setCurrentStep(0)}>
                Basic Info
              </StepButton>
            </Step>
            <Step key={1} completed={isAuthorAndVidCompleted}>
              <StepButton color="inherit" onClick={() => setCurrentStep(1)}>
                Author and video data
              </StepButton>
            </Step>
            <Step key={2}>
              <StepButton color="inherit" onClick={() => setCurrentStep(2)}>
                Sync lyrics to video
              </StepButton>
            </Step>
            <Step key={3}>
              <StepButton color="inherit" onClick={() => setCurrentStep(3)}>
                Fill song metadata
              </StepButton>
            </Step>
          </Stepper>
        </Grid>
        <Grid item xs={12}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (currentStep < steps.length - 1) setCurrentStep((current) => current + 1);
              else if (steps.at(currentStep) === 'metadata') {
                setIsSaving(true);
                await SongDao.store(finalSong!);
                await shareSong(finalSong!.id);
                setIsSaving(false);
                navigate(`edit/list/`, { id: finalSong!.id, created: !isEdit ? 'true' : null, song: null });
              }
            }}>
            {steps.at(currentStep) === 'basic-data' && (
              <BasicData
                shouldAutoImport={!isAuthorAndVidCompleted}
                isTxtRequired={!song}
                onAutoImport={setAuthorAndVid}
                onChange={setBasicData}
                data={basicData}
                finalSong={finalSong}
              />
            )}

            {steps.at(currentStep) === 'author-and-video' && (
              <AuthorAndVideo
                songArtist={conversionResult?.artist}
                songTitle={conversionResult?.title}
                onChange={setAuthorAndVid}
                data={authorAndVid}
              />
            )}

            {conversionResult && ( // Keep the component even if in different step so it preserves the state
              <SyncLyricsToVideo
                onChange={setEditedSong}
                data={conversionResult}
                visible={steps.at(currentStep) === 'sync'}
              />
            )}

            {steps.at(currentStep) === 'metadata' && (
              <SongMetadata
                videoGap={editedSong?.videoGap}
                onChange={setMetadataEntity}
                data={metadataEntity}
                songArtist={conversionResult?.artist}
                videoId={conversionResult?.video ?? ''}
              />
            )}

            {possibleDuplicate && (
              <Alert severity="warning" data-test="possible-duplicate">
                <AlertTitle>Possible duplicate</AlertTitle>
                There is already a song with similar artist and/or name:{' '}
                <b>
                  {possibleDuplicate.artist} - {possibleDuplicate.title}
                </b>
              </Alert>
            )}
            <Paper
              sx={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                width: '1260px',
                padding: 1,
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
              }}
              elevation={3}>
              <Button
                data-test="previous-button"
                sx={{ align: 'right' }}
                onClick={() => setCurrentStep((current) => current - 1)}
                disabled={currentStep === 0}>
                Previous
              </Button>
              {steps.at(currentStep) === 'metadata' ? (
                <Button
                  data-test="save-button"
                  sx={{ align: 'right' }}
                  type="submit"
                  variant={'contained'}
                  disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              ) : (
                <Button
                  data-test="next-button"
                  sx={{ align: 'right' }}
                  variant={'contained'}
                  type="submit"
                  disabled={!isNextStepAvailable || currentStep === steps.length - 1}>
                  Next
                </Button>
              )}
            </Paper>
          </form>
        </Grid>
      </Grid>
    </StyledEngineProvider>
  );
}
