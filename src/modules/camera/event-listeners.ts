import CameraManager from '~/modules/camera/camera-manager';
import events from '~/modules/game-events/game-events';

events.songStarted.subscribe(() => {
  CameraManager.clearData();
  CameraManager.startRecord();
});
events.songEnded.subscribe(() => {
  CameraManager.stopRecord();
});
