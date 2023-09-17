import CameraManager from 'Camera/CameraManager';
import events from 'GameEvents/GameEvents';

events.songStarted.subscribe(() => {
  CameraManager.clearData();
  CameraManager.startRecord();
});
events.songEnded.subscribe(() => {
  CameraManager.stopRecord();
});
