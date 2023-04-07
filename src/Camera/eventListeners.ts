import events from 'GameEvents/GameEvents';
import CameraManager from 'Camera/CameraManager';

events.songStarted.subscribe(() => {
    CameraManager.clearData();
    CameraManager.startRecord();
});
events.songEnded.subscribe(() => {
    CameraManager.stopRecord();
});
