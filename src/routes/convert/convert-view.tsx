import { Alert, AlertTitle, Button, Grid, Paper, Step, StepButton } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import { StyledEngineProvider } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { ValuesType } from 'utility-types';
import { Link } from 'wouter';
import { Song } from '~/interfaces';
import { useBackground } from '~/modules/elements/background-context';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useQueryParam from '~/modules/hooks/use-query-param';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import SongDao from '~/modules/songs/songs-service';
import convertTxtToSong, { getVideoId } from '~/modules/songs/utils/convert-txt-to-song';
import getSongId from '~/modules/songs/utils/get-song-id';
import setQueryParam from '~/modules/utils/set-query-param';
import { getAdminPassword } from '~/routes/admin/admin-password';
import { getNextAdminSharedSongProcessingUrl } from '~/routes/admin/shared-song-processing-queue';
import { listAdminSharedSongs, updateAdminSharedSong } from '~/routes/admin/shared-songs-admin-api';
import AuthorAndVideo, { AuthorAndVidEntity } from '~/routes/convert/steps/author-and-video';
import BasicData, { BasicDataEntity } from '~/routes/convert/steps/basic-data';
import SongMetadata, { SongMetadataEntity } from '~/routes/convert/steps/song-metadata';
import SyncLyricsToVideo from '~/routes/convert/steps/sync-lyrics-to-video';
import { shareSong } from '~/routes/edit/share-songs-modal';

interface Props {
  song?: Song;
  adminSharedSongExternalId?: string;
}

function isEmptyValue<T>(v: T | T[] | undefined) {
  return Array.isArray(v) ? v.length === 0 : !v;
}

const steps = ['basic-data', 'author-and-video', 'sync', 'metadata'] as const;

export default function ConvertView({ song, adminSharedSongExternalId }: Props) {
  const isEdit = !!song;
  const { data: songs } = useSongIndex(true);
  useBackground(false);
  const navigate = useSmoothNavigate();
  useBackgroundMusic(false);
  const initialStep = useQueryParam('step') as ValuesType<typeof steps> | null;
  const [currentStep, setCurrentStep] = useState(Math.max(0, steps.indexOf(initialStep!)));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const redirect = useQueryParam('redirect');
  const isAdminProcessingQueue = useQueryParam('processQueue') === 'true';

  useEffect(() => {
    if (steps[currentStep]) {
      setQueryParam({ step: steps[currentStep] });
    }
  }, [currentStep]);

  useEffect(() => {
    const queryStepIndex = steps.indexOf(initialStep!);

    if (queryStepIndex >= 0) {
      setCurrentStep((current) => (current === queryStepIndex ? current : queryStepIndex));
    }
  }, [initialStep]);

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
    volume: song?.volume ?? 70,
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
    } catch (e: unknown) {
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

  const getAdminProcessingQueueRedirect = async () => {
    const songs = await listAdminSharedSongs(getAdminPassword());

    return getNextAdminSharedSongProcessingUrl(songs, adminSharedSongExternalId!);
  };

  const saveSong = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (adminSharedSongExternalId) {
        const saveAdminSharedSong = async () => {
          await SongDao.store(finalSong!);
          await shareSong(finalSong!.id);
          await updateAdminSharedSong(adminSharedSongExternalId, finalSong!);
        };

        if (isAdminProcessingQueue) {
          const nextUrl = await getAdminProcessingQueueRedirect();
          void saveAdminSharedSong().catch((error) => {
            console.error('Failed to save admin shared song', error);
          });
          navigate(nextUrl);
          return;
        }

        await saveAdminSharedSong();
        navigate('admin/');
        return;
      }

      if (redirect && !adminSharedSongExternalId) {
        // dont wait for the share to finish if redirect is set
        SongDao.store(finalSong!);
        shareSong(finalSong!.id);
        navigate(`${redirect}?previousSongId=${finalSong!.id}`);
        return;
      }

      await SongDao.store(finalSong!);
      await shareSong(finalSong!.id);

      navigate(`edit/list/`, { id: finalSong!.id, created: !isEdit ? 'true' : null, song: null });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save song');
    } finally {
      setIsSaving(false);
    }
  };

  const onNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((current) => current + 1);
    } else if (steps[currentStep] === 'metadata') {
      void saveSong();
    }
  };

  useHotkeys(
    'shift+enter',
    () => {
      onNextStep();
    },
    [onNextStep],
  );

  const isLastStep = steps.at(currentStep) === 'metadata';

  return (
    <StyledEngineProvider injectFirst>
      <Grid container spacing={2} sx={{ p: 1, pt: 0, pb: 10 }}>
        <Grid size={12}>
          {!isEdit && (
            <div style={{ marginBottom: '1rem' }}>
              <Link to="menu/">
                <a>Return to the main menu</a>
              </Link>
            </div>
          )}
        </Grid>
        <Grid size={12} className="md:py-4">
          <Stepper activeStep={currentStep} nonLinear={isEdit}>
            <Step key={0} completed={isBasicInfoCompleted}>
              <StepButton color="inherit" onClick={() => setCurrentStep(0)}>
                <span className="hidden md:block">Basic Info</span>
              </StepButton>
            </Step>
            <Step key={1} completed={isAuthorAndVidCompleted}>
              <StepButton color="inherit" onClick={() => setCurrentStep(1)}>
                <span className="hidden md:block">Author and video data</span>
              </StepButton>
            </Step>
            <Step key={2}>
              <StepButton color="inherit" onClick={() => setCurrentStep(2)}>
                <span className="hidden md:block">Sync lyrics to video</span>
              </StepButton>
            </Step>
            <Step key={3}>
              <StepButton color="inherit" onClick={() => setCurrentStep(3)}>
                <span className="hidden md:block">Fill song metadata</span>
              </StepButton>
            </Step>
          </Stepper>
        </Grid>
        <Grid size={12}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              onNextStep();
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
            {saveError && <Alert severity="error">{saveError}</Alert>}
            <Paper
              sx={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                maxWidth: '1260px',
                width: '100%',
                padding: 1,
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
                justifyContent: 'space-between',
              }}
              elevation={3}>
              {redirect && (
                <Button
                  disabled={isSaving}
                  sx={{ align: 'right' }}
                  onClick={async () => {
                    setIsSaving(true);
                    await SongDao.store(finalSong!);
                    setIsSaving(false);
                    navigate(redirect);
                  }}>
                  Skip
                </Button>
              )}

              <div className="flex items-end">
                <Button
                  data-test="previous-button"
                  sx={{ align: 'right' }}
                  onClick={() => setCurrentStep((current) => current - 1)}
                  disabled={currentStep === 0}>
                  Previous
                </Button>
                {isLastStep ? (
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
                    disabled={isSaving || !isNextStepAvailable || currentStep === steps.length - 1}>
                    Next
                  </Button>
                )}
              </div>
            </Paper>
          </form>
        </Grid>
      </Grid>
    </StyledEngineProvider>
  );
}
