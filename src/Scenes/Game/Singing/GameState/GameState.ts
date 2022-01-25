import { FrequencyRecord, PlayerNote, SingSetup, Song } from '../../../../interfaces';
import isNotesSection from '../Helpers/isNotesSection';
import { getNoteAtBeat } from '../Helpers/notesSelectors';
import DummyInput from '../Input/DummyInput';
import InputInterface from '../Input/Interface';
import MicInput from '../Input/MicInput';
import { appendFrequencyToPlayerNotes } from './Helpers/appendFrequencyToPlayerNotes';
import calculateScore from './Helpers/calculateScore';
import getCurrentBeat from './Helpers/getCurrentBeat';
import getSongBeatLength from './Helpers/getSongBeatLength';

const Input = DummyInput;
const Input1 = MicInput;

class PlayerState {
    private frequencyRecords: FrequencyRecord[] = [];
    private playerNotes: PlayerNote[] = [];
    private min = Infinity;
    private max = -Infinity;

    public constructor(
        private index: number,
        private input: InputInterface,
        private inputChannel: number,
        private gameState: GameState,
    ) {
        this.getTrack()
            .sections.filter(isNotesSection)
            .forEach((section) =>
                section.notes.forEach((note) => {
                    this.min = Math.min(this.min, note.pitch);
                    this.max = Math.max(this.max, note.pitch);
                }),
            );
    }

    public update = () => {
        const currentTime = this.gameState.getCurrentTime();

        const frequencies = this.input.getFrequencies();

        const record = {
            timestamp: currentTime - this.input.getInputLag(),
            frequency: frequencies[this.inputChannel],
        };

        this.frequencyRecords.push(record);

        this.updatePlayerNotes(record);
    };

    public updatePlayerNotes = (record: FrequencyRecord) => {
        const recordBeat = record.timestamp / this.gameState.getSongBeatLength();
        const recordSection = this.getSectionByBeat(recordBeat);

        if (isNotesSection(recordSection)) {
            const note = getNoteAtBeat(recordSection, recordBeat, 0.5);

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
            if (sections[index + 1].start > beat) {
                return true;
            }
            return false;
        });
    };

    public getCurrentSectionIndex = () => this.getSectionIndexByBeat(this.gameState.getCurrentBeat());

    public getSectionByBeat = (beat: number) => this.getTrack().sections[this.getSectionIndexByBeat(beat)] ?? null;

    public getCurrentSection = () => {
        const sectionIndex = this.getCurrentSectionIndex();

        return this.getTrack().sections[sectionIndex] ?? null;
    };

    public getNextSection = () => {
        const sectionIndex = this.getCurrentSectionIndex();

        return sectionIndex > -1 ? this.getTrack().sections[sectionIndex + 1] ?? null : null;
    };

    public getPreviousSection = () => {
        const sectionIndex = this.getCurrentSectionIndex();

        return sectionIndex > -1 ? this.getTrack().sections[sectionIndex - 1] ?? null : null;
    };

    public getScore = () => calculateScore(this.playerNotes, this.gameState.getSong()!, this.getTrackIndex());

    public getMinPitch = () => this.min;
    public getMaxPitch = () => this.max;

    public getTrackIndex = () => this.gameState.getSingSetup()!.playerTracks[this.index];
    public getTrack = () => this.gameState.getSong()!.tracks[this.getTrackIndex()];

    public getInput = () => this.input;
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

        this.playerStates = singSetup.playerTracks.map((_, index) => new PlayerState(index, Input, index, this));
    };
    public getSingSetup = () => this.singSetup;

    public setDuration = (currentTime: number) => (this.currentTime = currentTime);
    public getDuration = () => this.duration;

    public getPlayer = (player: number) => this.playerStates[player];

    public startInputMonitoring = async () => {
        return Promise.all(this.playerStates.map((player) => player.getInput().startMonitoring()));
    };

    public stopInputMonitoring = () => {
        return Promise.all(this.playerStates.map((player) => player.getInput().stopMonitoring()));
    };

    public update = () => {
        this.playerStates.forEach((player) => player.update());
    };
}

export default new GameState();
