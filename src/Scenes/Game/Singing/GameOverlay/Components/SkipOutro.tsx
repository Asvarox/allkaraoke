import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import useDebounce from 'hooks/useDebounce';
import posthog from 'posthog-js';
import React, { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useInterval } from 'react-use';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import beatToMs from 'Scenes/Game/Singing/GameState/Helpers/beatToMs';
import { getLastNoteEnd } from 'Songs/utils/notesSelectors';

interface Props {
    onSongEnd: () => void;
}

const SHOW_OUTRO_THRESHOLD_MS = 15_000;

function SkipOutro({ onSongEnd }: Props) {
    const duration = GameState.getDuration();

    const singingEndBeat = useMemo(
        () => Math.max(...GameState.getPlayers().map((player) => getLastNoteEnd(player.getLastNotesSection()))),
        [],
    );

    const isEnabled = useMemo(() => {
        const singingEndTime = beatToMs(singingEndBeat, GameState.getSong()!);

        return duration * 1000 > singingEndTime + SHOW_OUTRO_THRESHOLD_MS;
    }, [duration, singingEndBeat]);

    const [currentBeat, setCurrentBeat] = useState(0);
    const [skipping, setSkipping] = useState(false);

    useInterval(() => setCurrentBeat(GameState.getCurrentBeat()), 1_000);

    const shouldBeVisible = useDebounce(isEnabled && currentBeat > singingEndBeat, 5_000) && !skipping;

    const skipOutro = () => {
        setSkipping(true);
        setTimeout(onSongEnd, 700);

        const { artist, title } = GameState.getSong()!;
        posthog.capture('outroSkipped', { name: `${artist} - ${title}`, artist, title });
    };
    useHotkeys('Enter', skipOutro, { enabled: shouldBeVisible });

    return isEnabled ? (
        <Container visible={shouldBeVisible}>
            Press <Kbd>Enter</Kbd> to skip the outro
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

export default React.memo(SkipOutro);
