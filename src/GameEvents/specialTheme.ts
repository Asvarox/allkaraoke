import events from 'GameEvents/GameEvents';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import { switchToTheme } from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { BackgroundThemeSetting } from 'Scenes/Settings/SettingsState';

BackgroundThemeSetting.addListener((style) => {
  switchToTheme(style);
  RemoteMicManager.broadcast({ t: 'style-change', style });
});

events.remoteMicConnected.subscribe((remoteMic) => {
  RemoteMicManager.getRemoteMicById(remoteMic.id)?.connection.send({
    t: 'style-change',
    style: BackgroundThemeSetting.get(),
  });
});
