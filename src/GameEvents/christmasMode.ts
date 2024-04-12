import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import { restoreDefaultColors, switchToChristmasColors } from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';

const enableChristmasMode = () => {
  switchToChristmasColors();
  RemoteMicManager.broadcast({ t: 'style-change', style: 'christmas' });
};

const disableChristmasMode = () => {
  restoreDefaultColors();
  RemoteMicManager.broadcast({ t: 'style-change', style: 'regular' });
};

// BackgroundThemeSetting.addListener((style) => {
//   if (style === 'christmas') {
//     enableChristmasMode();
//   } else {
//     disableChristmasMode();
//   }
// });
//
// events.remoteMicConnected.subscribe((remoteMic) => {
//   if (BackgroundThemeSetting.get() === 'christmas') {
//     RemoteMicManager.getRemoteMicById(remoteMic.id)?.connection.send({ t: 'style-change', style: 'christmas' });
//   }
// });
