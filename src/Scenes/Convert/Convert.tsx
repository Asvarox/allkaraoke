import { NotesSection, Song } from 'interfaces';
import { ChangeEventHandler, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import EditSong from '../Edit/EditSong';
import convertTxtToSong from './convertTxtToSong';
import importUltrastarEsSong from './importUltrastarEsSong';

interface Props {}

export default function Convert(props: Props) {
    const [txtInput, setTxtInput] = useState<string>('');
    const [videoLink, setVideoLink] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [authorUrl, setAuthorUrl] = useState<string>('');
    const [sourceUrl, setSourceUrl] = useState<string>('');

    const [editedSong, setEditedSong] = useState<Song | undefined>(undefined);

    const onSourceUrlEdit: ChangeEventHandler<HTMLInputElement> = async (e) => {
        setSourceUrl(e.target.value);
        if (author === '' && authorUrl === '' && videoLink === '') {
            const data = await importUltrastarEsSong(e.target.value);

            setAuthor(data.author);
            setAuthorUrl(data.authorUrl);
            setVideoLink(data.videoUrl);
        }
    };

    const error = useRef<string>('');
    const conversionResult: Song | undefined = useMemo(() => {
        try {
            return convertTxtToSong(txtInput, videoLink, author, authorUrl, sourceUrl);
        } catch (e: any) {
            error.current = e.message;
            console.error(e);
        }
        return undefined;
    }, [txtInput, videoLink, author, authorUrl, sourceUrl]);

    const searchForVideo = () => {
        window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(
                conversionResult?.artist + ' ' + conversionResult?.title,
            )}`,
            '_blank',
        );
    };

    const jsonPreview = editedSong ?? conversionResult;

    return (
        <Container>
            {conversionResult &&
                conversionResult.video.length < 15 &&
                !!(conversionResult.tracks[0].sections[0] as NotesSection).notes.length && (
                    <EditSong song={conversionResult} onUpdate={setEditedSong} />
                )}
            <Converter>
                <div style={{ flex: 1 }}>
                    <Input type="text" value={sourceUrl} onChange={onSourceUrlEdit} placeholder="Source URL" />
                    <InputGroup>
                        <InputGroupInput
                            data-test="input-video-url"
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
                    <TxtInput
                        onChange={(e) => setTxtInput(fixDiacritics(e.target.value))}
                        value={txtInput}
                        data-test="input-txt"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <JsonOutput
                        data-test="output"
                        disabled
                        value={jsonPreview ? JSON.stringify(jsonPreview, undefined, 2) : error.current}
                    />
                </div>
            </Converter>
        </Container>
    );
}

const Container = styled.div`
    background: white;
    margin: 0 auto;
    margin-top: 30px;
    width: 1440px;
    height: 100%;
`;

const InputGroup = styled.div`
    display: flex;
`;

const InputGroupButton = styled.button`
    flex: 1;
`;

const InputGroupInput = styled.input`
    flex: 1;
    min-width: 100px;
    padding: 3px;
`;

const Converter = styled.div`
    display: flex;
`;

const Input = styled.input`
    width: 720px;
    padding: 3px;
`;

const TxtInput = styled.textarea`
    width: 720px;
    height: 500px;
`;

const JsonOutput = styled.textarea`
    width: 720px;
    height: 100%;
    height: 500px;
    flex: 1;
`;

function fixDiacritics(txt: string): string {
    return txt
        .replaceAll('È', 'é')
        .replaceAll('í', "'")
        .replaceAll('¥', "'")

        .replaceAll('¯', 'Ż')
        .replaceAll('¹', 'ą')
        .replaceAll('π', 'ą')
        .replaceAll('ê', 'ę')
        .replaceAll('Í', 'ę')
        .replaceAll('Œ', 'Ś')
        .replaceAll('å', 'Ś')
        .replaceAll('œ', 'ś')
        .replaceAll('ú', 'ś')
        .replaceAll('æ', 'ć')
        .replaceAll('Ê', 'ć')
        .replaceAll('¿', 'ż')
        .replaceAll('ø', 'ż')
        .replaceAll('Ø', 'Ż')
        .replaceAll('ñ', 'ń')
        .replaceAll('Ò', 'ń')
        .replaceAll('³', 'ł')
        .replaceAll('≥', 'ł')
        .replaceAll('≥', 'ł')
        .replaceAll('£', 'Ł')
        .replaceAll('Û', 'ó')
        .replaceAll('ü', 'ź')
        .replaceAll('Ÿ', 'ź');
}
