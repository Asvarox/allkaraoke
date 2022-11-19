import styled from '@emotion/styled';
import { Box, Button, Step, StepLabel, StyledEngineProvider } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import { Song } from 'interfaces';
import { useEffect, useMemo, useRef, useState } from 'react';
import convertTxtToSong from 'Scenes/Convert/convertTxtToSong';
import AuthorAndVid, { AuthorAndVidEntity } from 'Scenes/Convert/Steps/AuthorAndVid';
import BasicData, { BasicDataEntity } from 'Scenes/Convert/Steps/BasicData';
import SongMetadata, { SongMetadataEntity } from 'Scenes/Convert/Steps/SongMetadata';
import SyncLyricsToVideo from 'Scenes/Convert/Steps/SyncLyricsToVideo';

interface Props {
    song?: Song;
}

const steps = ['basic-data', 'author-and-video', 'sync', 'metadata'] as const;
export default function Convert({ song }: Props) {
    const [currentStep, setCurrentStep] = useState(0);

    const [basicData, setBasicData] = useState<BasicDataEntity>({ sourceUrl: song?.sourceUrl ?? '', txtInput: '' });
    const [authorAndVid, setAuthorAndVid] = useState<AuthorAndVidEntity>({
        author: song?.author ?? '',
        authorUrl: song?.authorUrl ?? '',
        video: song?.video ?? '',
    });
    const [metadataEntity, setMetadataEntity] = useState<SongMetadataEntity>({
        realBpm: String(song?.realBpm) ?? '',
        year: song?.year ?? '',
        language: song?.language ?? '',
    });

    const [editedSong, setEditedSong] = useState<Song | undefined>(song);

    const error = useRef<string>('');
    const conversionResult: Song | undefined = useMemo(() => {
        try {
            if (song) return song;
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
    ]);

    useEffect(() => {
        if (conversionResult && !metadataEntity.year && !metadataEntity.language) {
            setMetadataEntity((current) => ({
                ...current,
                year: conversionResult.year ?? '',
                language: conversionResult.language ?? '',
            }));
        }
    }, [metadataEntity.year, metadataEntity.language, conversionResult]);

    const isBasicInfoCompleted = !!basicData.txtInput || !!song;
    const isAuthorAndVidCompleted = !!authorAndVid.video;

    const isNextStepAvailable = steps[currentStep] === 'author-and-video' ? isAuthorAndVidCompleted : true;

    const finalSong: Song = {
        ...editedSong!,
        ...metadataEntity,
        author: authorAndVid.author,
        authorUrl: authorAndVid.authorUrl,
        realBpm: +metadataEntity.realBpm,
        sourceUrl: basicData.sourceUrl,
    };

    return (
        <StyledEngineProvider injectFirst>
            <Container>
                <Stepper activeStep={currentStep} sx={{ mb: 2 }}>
                    <Step key={0} completed={isBasicInfoCompleted}>
                        <StepLabel>Basic Info</StepLabel>
                    </Step>
                    <Step key={1} completed={isAuthorAndVidCompleted}>
                        <StepLabel>Author and video data</StepLabel>
                    </Step>
                    <Step key={2}>
                        <StepLabel>Sync lyrics to video</StepLabel>
                    </Step>
                    <Step key={3}>
                        <StepLabel>Fill song metadata</StepLabel>
                    </Step>
                </Stepper>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (currentStep < steps.length - 1) setCurrentStep((current) => current + 1);
                    }}>
                    {steps.at(currentStep) === 'basic-data' && (
                        <BasicData
                            shouldAutoImport={!isAuthorAndVidCompleted}
                            isTxtRequired={!song}
                            onAutoImport={setAuthorAndVid}
                            onChange={setBasicData}
                            data={basicData}
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
                            onChange={setMetadataEntity}
                            data={metadataEntity}
                            songArtist={conversionResult?.artist}
                            songTitle={conversionResult?.title}
                        />
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
                            <Button
                                data-test="download-button"
                                href={`data:application/json;charset=utf-8,${encodeURIComponent(
                                    JSON.stringify(finalSong, undefined, 2),
                                )}`}
                                download={`${editedSong?.artist}-${editedSong?.title}.json`}
                                sx={{ mt: 2, align: 'right' }}
                                type="submit"
                                variant={'contained'}>
                                Download
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
    margin: 0 auto;
    margin-top: 30px;
    width: 1260px;
    height: 100%;
`;
