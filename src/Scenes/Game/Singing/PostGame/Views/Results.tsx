import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import useKeyboard from 'hooks/useKeyboard';
import { GAME_MODE, HighScoreEntity, SingSetup } from 'interfaces';
import React, { useMemo, useState } from 'react';
import { sumDetailedScore } from 'Scenes/Game/Singing/GameState/Helpers/calculateScore';
import useKeyboardHelp from 'hooks/useKeyboardHelp';
import CameraRoll from 'Scenes/Game/Singing/PostGame/Views/Results/CameraRoll';
import { PlayerScore } from 'Scenes/Game/Singing/PostGame/PostGameView';
import PlayerScoreView from 'Scenes/Game/Singing/PostGame/Views/Results/PlayerScore';
import CameraManager from 'Camera/CameraManager';

interface Props {
    onNextStep: () => void;
    players: PlayerScore[];
    highScores: HighScoreEntity[];
    singSetup: SingSetup;
}

function ResultsView({ onNextStep, players, highScores, singSetup }: Props) {
    useKeyboard({
        accept: onNextStep,
    });
    const help = useMemo(
        () => ({
            accept: 'Next',
        }),
        [],
    );
    useKeyboardHelp(help, true);

    const isCoop = singSetup.mode === GAME_MODE.CO_OP;
    const finalPlayers = isCoop ? [{ ...players[0], name: players.map((player) => player.name).join(', ') }] : players;

    const [finishedAnims, setFinishedAnims] = useState(finalPlayers.map(() => false));
    const isAnimDone = finishedAnims.every((anim) => anim);

    const playerScores = finalPlayers.map((player) => sumDetailedScore(player.detailedScore[0]));
    const highestScore = Math.max(...playerScores);

    return (
        <>
            <ScoresContainer>
                {finalPlayers.map((player, number) => (
                    <PlayerScoreView
                        playerNumber={player.playerNumber}
                        useColors={!isCoop}
                        revealHighScore={isAnimDone}
                        setAnimDone={(which) =>
                            setFinishedAnims((current) => {
                                current[which] = true;
                                return [...current];
                            })
                        }
                        key={number}
                        player={player}
                        highScores={highScores}
                        highestScore={highestScore}
                        singSetup={singSetup}
                    />
                ))}
            </ScoresContainer>
            <SongSelectionButton onClick={onNextStep} focused data-test="highscores-button">
                Next
            </SongSelectionButton>
            {CameraManager.getPermissionStatus() && <StyledPhotoRoll />}
        </>
    );
}

const ScoresContainer = styled.div`
    position: absolute;
    top: 20rem;
    width: 100%;
    text-align: center;
`;

const SongSelectionButton = styled(Button)<{ focused: boolean }>`
    position: absolute;
    bottom: 4rem;
    right: 2rem;
    width: 40rem;
    font-size: 1.9vw;
`;

const StyledPhotoRoll = styled(CameraRoll)`
    position: absolute;
    top: calc(50% - 30rem);
    left: 95rem;
    transform: scale(0.75);
`;

export default ResultsView;
