import { Alert, AlertTitle, Button, Grid, Paper, Step, StepButton, StyledEngineProvider } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import { Dispatch, memo, SetStateAction, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { ValuesType } from 'utility-types';
import { Link } from 'wouter';
import { Song } from '~/interfaces';
import { useBackground } from '~/modules/elements/background-context';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useQueryParam from '~/modules/hooks/use-query-param';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import SongDao from '~/modules/songs/songs-service';
import setQueryParam from '~/modules/utils/set-query-param';
import ConvertForm from '~/routes/convert/convert-form';
import {
  useConvertFormDerivedContext,
  useConvertFormFinalSongContext,
} from '~/routes/convert/convert-form-context-hooks';
import useConvertStepState from '~/routes/convert/hooks/use-convert-step-state';
import AuthorAndVideoStep from '~/routes/convert/steps/author-and-video-step';
import BasicDataStep from '~/routes/convert/steps/basic-data-step';
import SongMetadataStep from '~/routes/convert/steps/song-metadata-step';
import SyncLyricsToVideo from '~/routes/convert/steps/sync-lyrics-to-video';
import { shareSong } from '~/routes/edit/share-songs-modal';

interface Props {
  song?: Song;
}

const steps = ['basic-data', 'author-and-video', 'sync', 'metadata'] as const;

interface ConvertStepActionsProps {
  currentStep: number;
  isLastStep: boolean;
  isNextStepAvailable: boolean;
  isSaving: boolean;
  redirect: string | null;
  saveSong: (song: Song) => Promise<void>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
}

function ConvertStepActions({
  currentStep,
  isLastStep,
  isNextStepAvailable,
  isSaving,
  redirect,
  saveSong,
  setCurrentStep,
  setIsSaving,
}: ConvertStepActionsProps) {
  const finalSong = useConvertFormFinalSongContext();
  const navigate = useSmoothNavigate();

  const onNextStep = async () => {
    if (isSaving) {
      return;
    }

    if (isLastStep && finalSong) {
      await saveSong(finalSong);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((current) => current + 1);
    }
  };

  useHotkeys(
    'shift+enter',
    () => {
      onNextStep();
    },
    [onNextStep],
  );

  return (
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
          disabled={isSaving || !finalSong}
          sx={{ align: 'right' }}
          onClick={async () => {
            if (!finalSong) {
              return;
            }

            setIsSaving(true);
            try {
              await SongDao.store(finalSong);
              navigate(redirect);
            } finally {
              setIsSaving(false);
            }
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
            variant={'contained'}
            disabled={isSaving || !finalSong}
            onClick={() => {
              if (finalSong) {
                saveSong(finalSong);
              }
            }}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        ) : (
          <Button
            data-test="next-button"
            sx={{ align: 'right' }}
            variant={'contained'}
            onClick={() => {
              onNextStep();
            }}
            disabled={isSaving || !isNextStepAvailable || currentStep === steps.length - 1}>
            Next
          </Button>
        )}
      </div>
    </Paper>
  );
}

function ConvertViewContent({ song }: Props) {
  const { duplicateCandidate, isEdit } = useConvertFormDerivedContext();
  const { isAuthorAndVidCompleted, isBasicInfoCompleted } = useConvertStepState();
  useBackground(false);
  const navigate = useSmoothNavigate();
  useBackgroundMusic(false);
  const initialStep = useQueryParam('step') as ValuesType<typeof steps> | null;
  const [currentStep, setCurrentStep] = useState(Math.max(0, steps.indexOf(initialStep!)));
  const [isSaving, setIsSaving] = useState(false);
  const redirect = useQueryParam('redirect');

  useEffect(() => {
    if (steps[currentStep]) {
      setQueryParam({ step: steps[currentStep] });
    }
  }, [currentStep]);

  const isNextStepAvailable = steps[currentStep] === 'author-and-video' ? isAuthorAndVidCompleted : true;

  const saveSong = async (finalSong: Song) => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      if (redirect) {
        // Don't wait for sharing when returning to a redirect target.
        await SongDao.store(finalSong);
        void shareSong(finalSong.id);
        navigate(`${redirect}?previousSongId=${finalSong.id}`);
      } else {
        await SongDao.store(finalSong);
        await shareSong(finalSong.id);
        navigate(`edit/list/`, { id: finalSong.id, created: !isEdit ? 'true' : null, song: null });
      }
    } catch (error) {
      console.error('Failed to save song', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isLastStep = steps.at(currentStep) === 'metadata';

  return (
    <StyledEngineProvider injectFirst>
      <Grid container gap={2} p={1} pt={0} pb={10}>
        <Grid item xs={12}>
          {!isEdit && (
            <div style={{ marginBottom: '1rem' }}>
              <Link to="menu/">
                <a>Return to the main menu</a>
              </Link>
            </div>
          )}
        </Grid>
        <Grid item xs={12} className="md:py-4">
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
        <Grid item xs={12}>
          <form>
            {steps.at(currentStep) === 'basic-data' && <BasicDataStep isTxtRequired={!song} />}

            {steps.at(currentStep) === 'author-and-video' && <AuthorAndVideoStep />}

            <SyncLyricsToVideo visible={steps.at(currentStep) === 'sync'} />

            {steps.at(currentStep) === 'metadata' && <SongMetadataStep />}

            {duplicateCandidate && (
              <Alert severity="warning" data-test="possible-duplicate">
                <AlertTitle>Possible duplicate</AlertTitle>
                There is already a song with similar artist and/or name:{' '}
                <b>
                  {duplicateCandidate.artist} - {duplicateCandidate.title}
                </b>
              </Alert>
            )}
            <ConvertStepActions
              currentStep={currentStep}
              isLastStep={isLastStep}
              isNextStepAvailable={isNextStepAvailable}
              isSaving={isSaving}
              redirect={redirect}
              saveSong={saveSong}
              setCurrentStep={setCurrentStep}
              setIsSaving={setIsSaving}
            />
          </form>
        </Grid>
      </Grid>
    </StyledEngineProvider>
  );
}

const MemoizedConvertViewContent = memo(ConvertViewContent);

export default function ConvertView({ song }: Props) {
  return (
    <ConvertForm initialSong={song}>
      <MemoizedConvertViewContent song={song} />
    </ConvertForm>
  );
}
