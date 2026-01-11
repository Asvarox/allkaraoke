import CameraManager from '~/modules/Camera/CameraManager';
import events from '~/modules/GameEvents/GameEvents';

events.songStarted.subscribe(() => {
  CameraManager.clearData();
  CameraManager.startRecord();
});
events.songEnded.subscribe(() => {
  CameraManager.stopRecord();
});
