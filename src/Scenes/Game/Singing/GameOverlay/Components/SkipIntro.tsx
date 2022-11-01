import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { VideoPlayerRef } from 'Elements/VideoPlayer';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import getSongFirstNoteMs from 'Scenes/Game/Singing/GameState/Helpers/getSongFirstNoteMs';
import getSkipIntroTime, { SKIP_INTRO_MS } from 'Scenes/Game/Singing/Helpers/getSkipIntroTime';
import songHasLongIntro from 'utils/songHasLongIntro';

interface Props {
    playerRef: VideoPlayerRef | null;
}

function SkipIntro({ playerRef }: Props) {
    const song = GameState.getSong()!;
    const hasLongIntro = useMemo(() => songHasLongIntro(song), [song]);
    const songFirstNoteMs = useMemo(() => getSongFirstNoteMs(song), [song]);
    const shouldBeVisible = GameState.getCurrentTime(false) < songFirstNoteMs - SKIP_INTRO_MS;

    const isEnabled = shouldBeVisible && hasLongIntro;

    const skipIntro = () => {
        playerRef?.seekTo(getSkipIntroTime(song));

        const { artist, title } = GameState.getSong()!;
        posthog.capture('introSkipped', { name: `${artist} - ${title}`, artist, title });
    };
    useHotkeys('Enter', skipIntro, { enabled: isEnabled });

    return isEnabled ? (
        <Container visible={isEnabled} data-test="skip-intro-info">
            Press <Kbd>Enter</Kbd> to skip the intro
        </Container>
    ) : null;
}

const Container = styled.div<{ visible: boolean }>`
    ${typography};
    pointer-events: none;
    position: fixed;
    bottom: 6em;
    transform: scale(${(props) => (props.visible ? 1 : 0)});
    opacity: ${(props) => (props.visible ? 1 : 0)};
    text-align: center;
    font-size: 3em;
    text-shadow: 0 0 35px black;
    width: 100%;
    z-index: 4;
    padding: 0.5em;
    transition: ease 500ms;
`;

const Kbd = styled.kbd<{ disabled?: boolean }>`
    margin: 0.1em;
    padding: 0.04em 0.4em;
    border-radius: 0.3em;
    border: 0.12em solid rgb(204, 204, 204);
    border-bottom-color: rgb(150, 150, 150);
    border-right-color: rgb(150, 150, 150);
    //color: rgb(51, 51, 51);
    line-height: 1.4;
    //font-size: 16px;
    display: inline-block;
    background-color: rgb(247, 247, 247);
    text-shadow: 0 1px 0 #fff;

    opacity: ${(props) => (props.disabled ? 0.25 : 1)};
`;

export default SkipIntro;
