import events from 'GameEvents/GameEvents';
import { GameStateClass } from 'Scenes/Game/Singing/GameState/GameState';
import isNotesSection from 'Songs/utils/isNotesSection';
import { getNoteAtBeat } from 'Songs/utils/notesSelectors';
import { FrequencyRecord, NotesSection, PlayerNote } from 'interfaces';
import InputManager from '../Input/InputManager';
import { appendFrequencyToPlayerNotes } from './Helpers/appendFrequencyToPlayerNotes';
import calculateScore, { calculateDetailedScoreData } from './Helpers/calculateScore';

class PlayerState {
  private frequencyRecords: FrequencyRecord[] = [];
  private playerNotes: PlayerNote[] = [];
  private realFrequencyRecords: FrequencyRecord[] = [];
  private realPlayerNotes: PlayerNote[] = [];
  private min = Infinity;
  private max = -Infinity;

  private storedSectionIndex = 0;

  public constructor(private number: number, private gameState: GameStateClass) {
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

export default PlayerState;
