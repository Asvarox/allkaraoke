import { switchToTheme } from '~/modules/GameEngine/Drawing/styles';
import events from '~/modules/GameEvents/GameEvents';
import RemoteMicServer from '~/modules/RemoteMic/Network/Server';
import { BackgroundThemeSetting } from '~/routes/Settings/SettingsState';

BackgroundThemeSetting.addListener((style) => {
  switchToTheme(style);
  RemoteMicServer.callAllClients('setStyle', style);
});

events.remoteMicConnected.subscribe((remoteMic) => {
  RemoteMicServer.callClient(remoteMic.id, 'setStyle', BackgroundThemeSetting.get());
});
