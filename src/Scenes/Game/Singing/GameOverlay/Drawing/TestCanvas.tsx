import { useEffect, useRef } from "react";
import GameState from "Scenes/Game/Singing/GameState/GameState";
import { GAME_MODE, milliseconds } from "interfaces";
import InputManager from "Scenes/Game/Singing/Input/InputManager";
import CanvasDrawing from "Scenes/Game/Singing/GameOverlay/Drawing/CanvasDrawing";
import DrawingTestInput from "Scenes/Game/Singing/Input/DrawingTestInput";
import { mulitrack } from "Songs/utils/song-fixture";

interface Props {
    timeMs: milliseconds,
    frequencyChannel0: number,
    frequencyChannel1: number,
}

export const TestCanvas = (props: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef<null | CanvasDrawing>(null);

    useEffect(() => {
        window.Math.random = () => 0.5;

        GameState.setSong(mulitrack);
        GameState.setSingSetup({
            id: 'tests',
            players: [
                { name: 'Player 1', track: 0 },
                { name: 'Player 2', track: 1 },
            ],
            mode: GAME_MODE.DUEL,
            tolerance: 2,
        });

        InputManager.setPlayerInput(0, 'DrawingTest', 0);
        InputManager.setPlayerInput(1, 'DrawingTest', 1);
    }, []);

    useEffect(() => {
        if(canvasRef.current) {
            drawingRef.current = new CanvasDrawing(canvasRef.current);
        }
    }, [canvasRef.current]);

    useEffect(() => {
        GameState.setCurrentTime(props.timeMs)
    }, [props.timeMs]);

    useEffect(() => {
        DrawingTestInput.setFrequency(0, props.frequencyChannel0)
    }, [props.frequencyChannel0]);

    useEffect(() => {
        DrawingTestInput.setFrequency(0, props.frequencyChannel1)
    }, [props.frequencyChannel1]);

    return <div style={{ background: 'black'}}>
        <button data-test="update" onClick={() => {
            GameState.update();
            drawingRef.current?.drawFrame();
        }
        }>Update</button>
        <canvas ref={canvasRef} width={800} height={600} />
    </div>
}
