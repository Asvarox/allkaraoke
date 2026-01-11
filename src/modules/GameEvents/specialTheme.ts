import { switchToTheme } from '~/modules/GameEngine/Drawing/styles';
import events from '~/modules/GameEvents/GameEvents';
import RemoteMicManager from '~/modules/RemoteMic/RemoteMicManager';
import { BackgroundThemeSetting } from '~/routes/Settings/SettingsState';

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
