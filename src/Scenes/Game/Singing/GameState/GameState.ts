import { FrequencyRecord, GAME_MODE, NotesSection, PlayerNote, SingSetup, Song } from 'interfaces';
import isNotesSection from 'Songs/utils/isNotesSection';
import { getNoteAtBeat } from 'Songs/utils/notesSelectors';
import InputManager from '../Input/InputManager';
import { appendFrequencyToPlayerNotes } from './Helpers/appendFrequencyToPlayerNotes';
import calculateScore, {
    addDetailedScores,
    beatsToPoints,
    calculateDetailedScoreData,
    divideDetailedScores,
} from './Helpers/calculateScore';
import getCurrentBeat from './Helpers/getCurrentBeat';
import getSongBeatLength from 'Songs/utils/getSongBeatLength';
import events from 'GameEvents/GameEvents';
import tuple from 'utils/tuple';

class PlayerState {
    private frequencyRecords: FrequencyRecord[] = [];
    private playerNotes: PlayerNote[] = [];
    private realFrequencyRecords: FrequencyRecord[] = [];
    private realPlayerNotes: PlayerNote[] = [];
    private min = Infinity;
    private max = -Infinity;

    private storedSectionIndex = 0;

    public constructor(private number: number, private gameState: GameState) {
        this.getTrack()
            .sections.filter(isNotesSection)
            .forEach((section) =>
                section.notes.forEach((note) => {
                    this.min = Math.min(this.min, note.pitch);
                    this.max = Math.max(this.max, note.pitch);
                }),
            );
    }

    public getNumber = () => this.number;

    public update = () => {
        const currentTime = this.gameState.getCurrentTime();

        const frequency = InputManager.getPlayerFrequency(this.number);
        const currentTimestamp = currentTime - InputManager.getPlayerInputLag(this.number);

        // If it's a pack of frequencies (from remote mic), restore last "real" frequencies,
        // add and recalculate for the received pack, and store newly computed
        // frequencies for the moment when new package arrive.
        // If it's a single frequency, just add it to the notes
        if (Array.isArray(frequency)) {
            const lastRealRecord = this.realFrequencyRecords.at(-1) || this.frequencyRecords.at(0);
            const lastTimestamp = lastRealRecord?.timestamp ?? 0;
            const timestampStep = (currentTimestamp - lastTimestamp) / frequency.length;

            this.frequencyRecords = this.realFrequencyRecords;
            this.playerNotes = this.realPlayerNotes;

            for (let i = 0; i < frequency.length; i++) {
                const timestamp = lastTimestamp + timestampStep * (i + 1);
                this.updatePlayerNotes(timestamp, frequency[i]);
            }

            this.realFrequencyRecords = [...this.frequencyRecords];
            this.realPlayerNotes = [...this.playerNotes];
            // Last note can be mutated, so we create a shallow copy of it
            const lastNote = this.realPlayerNotes.at(-1);

            if (lastNote) {
                this.realPlayerNotes[this.realPlayerNotes.length - 1] = {
                    ...lastNote,
                    // This can be mutated as well
                    frequencyRecords: [...(lastNote.frequencyRecords ?? [])],
                };
            }
        } else {
            this.updatePlayerNotes(currentTimestamp, frequency);
        }

        this.dispatchSectionUpdate();
    };

    private dispatchSectionUpdate = () => {
        const currentSectionIndex = this.getCurrentSectionIndex();
        if (this.storedSectionIndex !== currentSectionIndex) {
            events.sectionChange.dispatch(this.number, this.storedSectionIndex);
            this.storedSectionIndex = currentSectionIndex;
        }
    };

    public updatePlayerNotes = (timestamp: number, frequency: number) => {
        const record = { timestamp, frequency };
        this.frequencyRecords.push(record);

        const recordBeat = record.timestamp / this.gameState.getSongBeatLength();
        const recordSection = this.getSectionByBeat(recordBeat);

        if (isNotesSection(recordSection)) {
            const note = getNoteAtBeat(recordSection, recordBeat, 0) ?? getNoteAtBeat(recordSection, recordBeat, 0.5);

            if (note) appendFrequencyToPlayerNotes(this.playerNotes, record, note, this.gameState.getSongBeatLength());
        }
    };

    public getPlayerNotes = () => this.playerNotes;
    public getPlayerFrequencies = () => this.frequencyRecords;

    public getSectionIndexByBeat = (beat: number) => {
        return this.getTrack().sections.findIndex((section, index, sections) => {
            if (beat < 0) return true;
            if (beat < section.start) return false;
            if (index === sections.length - 1) return true;
            return sections[index + 1].start > beat;
        });
    };

    public getCurrentSectionIndex = () => this.getSectionIndexByBeat(this.gameState.getCurrentBeat());

    public getSectionByBeat = (beat: number) => this.getTrack().sections[this.getSectionIndexByBeat(beat)] ?? null;

    public getCurrentSection = () => {
        const sectionIndex = this.getCurrentSectionIndex();

        return this.getTrack().sections[sectionIndex] ?? null;
    };

    public getNextSection = (index = 1) => {
        const sectionIndex = this.getCurrentSectionIndex();

        return sectionIndex > -1 ? this.getTrack().sections[sectionIndex + index] ?? null : null;
    };

    public getPreviousSection = (index = 1) => {
        const sectionIndex = this.getCurrentSectionIndex();

        return sectionIndex > -1 ? this.getTrack().sections[sectionIndex - index] ?? null : null;
    };

    public getLastNotesSection = () => {
        const last = this.getTrack().sections.at(-1);
        return isNotesSection(last) ? last : (this.getTrack().sections.at(-2) as NotesSection);
    };

    public getScore = () => calculateScore(this.playerNotes, this.gameState.getSong()!, this.getTrackIndex());
    public getDetailedScore = () =>
        calculateDetailedScoreData(this.playerNotes, this.gameState.getSong()!, this.getTrackIndex());

    public getMinPitch = () => this.min;
    public getMaxPitch = () => this.max;

    public getTrackIndex = () => this.gameState.getSingSetup()!.players[this.number].track;
    public getTrack = () => this.gameState.getSong()!.tracks[this.getTrackIndex()];

    public resetNotes = () => {
        this.playerNotes = [];
    };
}

class GameState {
    private song: Song | null = null;
    private currentTime: number = 0;
    private duration: number = 0;
    private singSetup: SingSetup | null = null;
    private playerStates: PlayerState[] = [];

    public setCurrentTime = (currentTime: number) => (this.currentTime = currentTime);
    public getCurrentTime = (accountGap = true) => {
        return this.currentTime - (accountGap && this.song ? this.song.gap : 0);
    };

    public getSongBeatLength = () => getSongBeatLength(this.song!);
    public getCurrentBeat = () => {
        return getCurrentBeat(this.getCurrentTime(), this.getSongBeatLength(), 0, false);
    };

    public setSong = (song: Song) => (this.song = song);
    public getSong = () => this.song;

    public setSingSetup = (singSetup: SingSetup) => {
        this.singSetup = singSetup;

        this.playerStates = singSetup.players.map(({ number }, index) => new PlayerState(number, this));
        this.currentTime = 0;
    };
    public getSingSetup = () => this.singSetup;
    public getTolerance = () => this.getSingSetup()?.tolerance ?? 2;

    public setDuration = (duration: number) => (this.duration = duration);
    public getDuration = () => this.duration;

    public getPlayer = (playerNumber: number) =>
        this.playerStates.find((player) => player.getNumber() === playerNumber);

    public getPlayers = () => this.playerStates;

    public getPlayerCount = () => this.playerStates.length;

    public getPlayerScore = (player: number) => {
        if (this.getSingSetup()?.mode === GAME_MODE.CO_OP) {
            const score = this.getPlayers().reduce((curr, playerState) => curr + playerState.getScore(), 0);

            return score / this.getPlayerCount();
        } else {
            return this.getPlayer(player)?.getScore() ?? -1;
        }
    };

    public getPlayerDetailedScore = (player: number) => {
        if (this.getSingSetup()?.mode === GAME_MODE.CO_OP) {
            const scores = this.getPlayers().map((playerState) => playerState.getDetailedScore());

            // getDetailedScore returns beats - calculate actual points for each player
            const [fs, ...pointsScores] = scores.map(
                ([pointsPerBeat, counts, maxCounts]) =>
                    [beatsToPoints(counts, pointsPerBeat), beatsToPoints(maxCounts, pointsPerBeat)] as const,
            );

            const summedPoints = pointsScores.reduce(
                (curr, pointsScore) => [
                    addDetailedScores(curr[0], pointsScore[0]),
                    addDetailedScores(curr[1], pointsScore[1]),
                ],
                fs,
            );
            return tuple([
                divideDetailedScores(summedPoints[0], this.getPlayerCount()),
                divideDetailedScores(summedPoints[1], this.getPlayerCount()),
            ]);
        } else {
            const [pointsPerBeat, counts, maxCounts] = this.getPlayer(player)!.getDetailedScore();

            return tuple([beatsToPoints(counts, pointsPerBeat), beatsToPoints(maxCounts, pointsPerBeat)]);
        }
    };

    public startInputMonitoring = async () => {
        return InputManager.startMonitoring();
    };

    public stopInputMonitoring = () => {
        return InputManager.stopMonitoring();
    };

    public update = () => {
        this.playerStates.forEach((player) => player.update());
    };
    public resetPlayerNotes = () => {
        this.playerStates.forEach((player) => player.resetNotes());
    };
}

export default new GameState();
