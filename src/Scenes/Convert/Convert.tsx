import { ChangeEventHandler, useRef, useState } from 'react';
import styled from 'styled-components';
import { Note, NotesSection, Song } from '../../interfaces';
import getSongBeatLength from '../Game/Singing/Helpers/getSongBeatLength';
import isNotesSection from '../Game/Singing/Helpers/isNotesSection';
import Player, { PlayerRef } from '../Game/Singing/Player';
import calculateProperBPM from './calculateProperBpm';
import convertTxtToSong from './convertTxtToSong';
import importUltrastarEsSong from './importUltrastarEsSong';

interface Props {}

const shiftGap = (song: Song, gapShift: number): Song => ({ ...song, gap: song.gap + gapShift });
const shiftVideoGap = (song: Song, gapShift: number): Song => ({ ...song, videoGap: (song.videoGap ?? 0) + gapShift });

const formatMsec = (msec: number) => {
    const minutes = Math.floor(msec / 1000 / 60);
    const seconds = Math.floor(msec / 1000) - minutes * 60;
    const miliseconds = Math.floor(msec % 1000);

    return (
        <Pre>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}.{String(miliseconds).padStart(3, '0')}
        </Pre>
    );
};

export default function Convert(props: Props) {
    const player = useRef<PlayerRef | null>(null);
    const [txtInput, setTxtInput] = useState<string>('');
    const [videoLink, setVideoLink] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [authorUrl, setAuthorUrl] = useState<string>('');
    const [sourceUrl, setSourceUrl] = useState<string>('');

    const [currentTime, setCurrentTime] = useState<number>(0);

    const [gapShift, setGapShift] = useState<number>(0);
    const [videoGapShift, setVideoGapShift] = useState<number>(0);

    const [desiredLastNoteEnd, setDesiredLastNoteEnd] = useState<number>(0);

    const onSourceUrlEdit: ChangeEventHandler<HTMLInputElement> = async (e) => {
        setSourceUrl(e.target.value);
        if (author === '' && authorUrl === '' && videoLink === '') {
            const data = await importUltrastarEsSong(e.target.value);

            setAuthor(data.author);
            setAuthorUrl(data.authorUrl);
            setVideoLink(data.videoUrl);
        }
    };

    let conversionResult: Song | undefined;
    let firstNote: Note | undefined;
    let lastNote: Note | undefined;
    let beatLength: number | undefined;
    let error = '';
    try {
        conversionResult = convertTxtToSong(txtInput, videoLink, author, authorUrl, sourceUrl);
        conversionResult = shiftGap(conversionResult, gapShift);
        conversionResult = shiftVideoGap(conversionResult, videoGapShift);

        beatLength = getSongBeatLength(conversionResult);

        const notesSections = conversionResult.tracks[0].sections.filter(isNotesSection);
        firstNote = notesSections[0].notes[0];

        const lastSection = notesSections[notesSections.length - 1];
        lastNote = lastSection.notes[lastSection.notes.length - 1];
    } catch (e: any) {
        error = e.message;
        console.error(e);
    }

    const searchForVideo = () => {
        window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
                conversionResult?.artist + ' ' + conversionResult?.title,
            )}`,
            '_blank',
        );
    };

    const seekTo = (toSec: number) => player.current?.seekTo((currentTime + toSec) / 1000);

    return (
        <Container>
            {conversionResult &&
                conversionResult.video.length < 15 &&
                !!(conversionResult.tracks[0].sections[0] as NotesSection).notes.length && (
                    <Preview>
                        <Player
                            song={conversionResult}
                            showControls
                            autoplay={false}
                            width={700}
                            height={(700 / 16) * 9}
                            ref={player}
                            onTimeUpdate={setCurrentTime}
                        />
                        <Editor>
                            <EditorRow>
                                Playback speed:
                                <InputGroup>
                                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                        <InputGroupButton
                                            key={speed}
                                            onClick={() => player.current?.setPlaybackSpeed(speed)}>
                                            {speed}
                                        </InputGroupButton>
                                    ))}
                                </InputGroup>
                            </EditorRow>
                            <EditorRow>
                                Current time: {formatMsec(currentTime)}
                                <InputGroup>
                                    <InputGroupButton onClick={() => seekTo(-10000)}>10000</InputGroupButton>
                                    <InputGroupButton onClick={() => seekTo(-1000)}>1000</InputGroupButton>
                                    <InputGroupButton onClick={() => seekTo(-500)}>-500</InputGroupButton>
                                    <div style={{ flex: 1 }}>
                                        <Pre>{currentTime.toFixed(0)}</Pre>
                                    </div>
                                    <InputGroupButton onClick={() => seekTo(+500)}>+500</InputGroupButton>
                                    <InputGroupButton onClick={() => seekTo(+1000)}>+1000</InputGroupButton>
                                    <InputGroupButton onClick={() => seekTo(+10000)}>+10000</InputGroupButton>
                                </InputGroup>
                            </EditorRow>
                            <EditorRow>
                                Gap shift (final gap: {formatMsec(conversionResult.gap)})
                                <InputGroup>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift - 1000)}>
                                        -1000
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift - 500)}>
                                        -500
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift - 50)}>
                                        -50
                                    </InputGroupButton>
                                    <InputGroupInput
                                        type="text"
                                        value={gapShift}
                                        onChange={(e) => setGapShift(+e.target.value)}
                                        placeholder="Gap shift"
                                    />
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift + 50)}>
                                        +50
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift + 500)}>
                                        +500
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift + 1000)}>
                                        +1000
                                    </InputGroupButton>
                                </InputGroup>
                            </EditorRow>
                            <EditorRow>
                                Video Gap shift (final video gap: {formatMsec((conversionResult.videoGap ?? 0) * 1000)})
                                <InputGroup>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift - 10)}>
                                        -10
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift - 5)}>
                                        -5
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift - 1)}>
                                        -1
                                    </InputGroupButton>
                                    <InputGroupInput
                                        type="text"
                                        value={videoGapShift}
                                        onChange={(e) => setVideoGapShift(+e.target.value)}
                                        placeholder="Gap shift"
                                    />
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift + 1)}>
                                        +1
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift + 5)}>
                                        +5
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift + 10)}>
                                        +10
                                    </InputGroupButton>
                                </InputGroup>
                            </EditorRow>
                            {!!firstNote && !!beatLength && (
                                <EditorRow>
                                    First note start: {formatMsec(firstNote.start * beatLength + conversionResult.gap)}
                                </EditorRow>
                            )}
                            {!!lastNote && !!beatLength && (
                                <EditorRow>
                                    Last note end:{' '}
                                    {formatMsec((lastNote.start + lastNote.length) * beatLength + conversionResult.gap)}
                                </EditorRow>
                            )}
                            <EditorRow>
                                <InputGroup>
                                    <span>Desired last note end</span>
                                    <InputGroupInput
                                        type="text"
                                        value={desiredLastNoteEnd}
                                        onChange={(e) => setDesiredLastNoteEnd(+e.target.value)}
                                        placeholder="Desired last note end"
                                    />
                                </InputGroup>
                                Est. proper BPM: <Pre>{calculateProperBPM(desiredLastNoteEnd, conversionResult)}</Pre>
                            </EditorRow>
                        </Editor>
                    </Preview>
                )}
            <Converter>
                <div style={{ flex: 1 }}>
                    <Input type="text" value={sourceUrl} onChange={onSourceUrlEdit} placeholder="Source URL" />
                    <InputGroup>
                        <InputGroupInput
                            type="text"
                            value={videoLink}
                            onChange={(e) => setVideoLink(e.target.value)}
                            placeholder="Link to Youtube Video"
                        />
                        <InputGroupButton onClick={searchForVideo}>Search for video</InputGroupButton>
                    </InputGroup>
                    <Input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Author name"
                    />
                    <Input
                        type="text"
                        value={authorUrl}
                        onChange={(e) => setAuthorUrl(e.target.value)}
                        placeholder="Author URL"
                    />
                    <TxtInput onChange={(e) => setTxtInput(fixDiacritics(e.target.value))} value={txtInput} />
                </div>
                <div style={{ flex: 1 }}>
                    {conversionResult && (
                        <a
                            href={`data:application/json;charset=utf-8,${encodeURIComponent(
                                JSON.stringify(conversionResult, undefined, 2),
                            )}`}
                            download={`${conversionResult.artist}-${conversionResult.title}.json`}>
                            Download
                        </a>
                    )}
                    <br />
                    <JsonOutput
                        disabled
                        value={conversionResult ? JSON.stringify(conversionResult, undefined, 2) : error}
                    />
                </div>
            </Converter>
        </Container>
    );
}

const InputGroup = styled.div`
    display: flex;
`;

const InputGroupButton = styled.button`
    flex: 1;
`;

const Pre = styled.span`
    font-family: monospace;
`;

const InputGroupInput = styled.input`
    flex: 1;
    min-width: 100px;
    padding: 3px;
`;

const Editor = styled.div`
    width: 400px;
`;

const EditorRow = styled.div`
    margin-bottom: 10px;
`;

const Container = styled.div`
    margin: 0 auto;
    margin-top: 30px;
    width: 1100px;
    height: 100%;
`;
const Preview = styled.div`
    display: flex;
`;

const Converter = styled.div`
    display: flex;
`;

const Input = styled.input`
    width: 550px;
    padding: 3px;
`;

const TxtInput = styled.textarea`
    width: 550px;
    height: 700px;
`;

const JsonOutput = styled.textarea`
    width: 550px;
    height: 100%;
    height: 700px;
    flex: 1;
`;

function fixDiacritics(txt: string): string {
    return txt
        .replaceAll('¹', 'ą')
        .replaceAll('ê', 'ę')
        .replaceAll('Œ', 'Ś')
        .replaceAll('œ', 'ś')
        .replaceAll('æ', 'ć')
        .replaceAll('¿', 'ż')
        .replaceAll('ñ', 'ń')
        .replaceAll('³', 'ł')
        .replaceAll('Û', 'ó')
        .replaceAll('¥', "'");
}
