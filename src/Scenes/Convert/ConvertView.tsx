import styled from '@emotion/styled';
import { Alert, AlertTitle, Box, Button, Step, StepButton, StyledEngineProvider } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import { useBackground } from 'Elements/LayoutWithBackground';
import NormalizeFontSize from 'Elements/NormalizeFontSize';
import AuthorAndVid, { AuthorAndVidEntity } from 'Scenes/Convert/Steps/AuthorAndVid';
import BasicData, { BasicDataEntity } from 'Scenes/Convert/Steps/BasicData';
import SongMetadata, { SongMetadataEntity } from 'Scenes/Convert/Steps/SongMetadata';
import SyncLyricsToVideo from 'Scenes/Convert/Steps/SyncLyricsToVideo';
import { shareSong } from 'Scenes/Edit/ShareSongsModal';
import SongDao from 'Songs/SongsService';
import useSongIndex from 'Songs/hooks/useSongIndex';
import convertTxtToSong, { getVideoId } from 'Songs/utils/convertTxtToSong';
import getSongId from 'Songs/utils/getSongId';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { Song } from 'interfaces';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';

interface Props {
  song?: Song;
}

const steps = ['basic-data', 'author-and-video', 'sync', 'metadata'] as const;

export default function ConvertView({ song }: Props) {
  const isEdit = !!song;
  const { data: songs } = useSongIndex(true);
  useBackground(false);
  const navigate = useSmoothNavigate();
  useBackgroundMusic(false);
  const [currentStep, setCurrentStep] = useState(0);

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
    language: song?.language ?? '',
    volume: song?.volume ?? 0,
    previewStart: song?.previewStart ?? undefined,
    previewEnd: song?.previewEnd ?? undefined,
    genre: song?.genre,
    edition: song?.edition,
  });

  const [editedSong, setEditedSong] = useState<Song | undefined>(song);

  const error = useRef<string>('');
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
      return convertTxtToSong(
        basicData.txtInput,
        authorAndVid.video,
        authorAndVid.author,
        authorAndVid.authorUrl,
        basicData.sourceUrl,
      );
    } catch (e: any) {
      error.current = e.message;
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
        ['year', 'language', 'realBpm', 'genre', 'artist', 'title', 'volume', 'previewStart', 'previewEnd'] as const
      ).forEach((property) => {
        if (!!conversionResult[property] && !metadataEntity[property]) {
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
      <Container>
        {!isEdit && (
          <div style={{ marginBottom: '1rem' }}>
            <Link to="menu">
              <a>Return to the main menu</a>
            </Link>
          </div>
        )}
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
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (currentStep < steps.length - 1) setCurrentStep((current) => current + 1);
            else if (steps.at(currentStep) === 'metadata') {
              await SongDao.store(finalSong!);
              if (!isEdit) {
                shareSong(finalSong!.id);
              }
              navigate(`edit?search=${encodeURIComponent(finalSong!.title)}${!isEdit ? `&id=${finalSong!.id}` : ''}`);
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
            <AuthorAndVid
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
              songTitle={conversionResult?.title}
              videoId={conversionResult!.video}
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              data-test="previous-button"
              sx={{ mt: 2, align: 'right' }}
              onClick={() => setCurrentStep((current) => current - 1)}
              disabled={currentStep === 0}>
              Previous
            </Button>
            {steps.at(currentStep) === 'metadata' ? (
              <Button data-test="save-button" sx={{ mt: 2, align: 'right' }} type="submit" variant={'contained'}>
                Save
              </Button>
            ) : (
              <Button
                data-test="next-button"
                sx={{ mt: 2, align: 'right' }}
                variant={'contained'}
                type="submit"
                disabled={!isNextStepAvailable || currentStep === steps.length - 1}>
                Next
              </Button>
            )}
          </Box>
        </form>
      </Container>
    </StyledEngineProvider>
  );
}

const Container = styled.div`
  background: white;
  margin: 30px auto 0;
  width: 1260px;
  height: 100%;
`;
