import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import events from 'GameEvents/GameEvents';
import { SingSetup, Song, SongPreview } from 'interfaces';
import posthog from 'posthog-js';
import { MobilePhoneModeSetting } from 'Scenes/Settings/SettingsState';

const trackSongData =
    (event: string) =>
    ({ artist, title }: Song | SongPreview, setup: SingSetup, scores: Array<{ name: string; score: number }> = []) => {
        const sameScores = scores.length > 1 && scores.every((score) => score.score === scores[0].score);
        const inputs = {
            input0: InputManager.getInputs()[0].inputSource,
            input1: InputManager.getInputs()[1].inputSource,
        };
        posthog.capture(event, {
            name: `${artist} - ${title}`,
            artist,
            title,
            mode: setup.mode,
            tolerance: setup.tolerance,
            players: setup.players.length,
            sameScores,
            mobilePhoneMode: !!MobilePhoneModeSetting.get(),
            ...inputs,
            ...scores.reduce((curr, score, index) => ({ ...curr, [`score${index}`]: score.score }), {}),
        });
    };

events.songStarted.subscribe(trackSongData('songStarted'));
events.songEnded.subscribe(trackSongData('songEnded'));
