import { switchToTheme } from '~/modules/GameEngine/Drawing/styles';
import RemoteMicServer from '~/modules/RemoteMic/Network/Server';
import { BackgroundThemeSetting } from '~/routes/Settings/SettingsState';

BackgroundThemeSetting.addListener((style) => {
  switchToTheme(style);
  RemoteMicServer.publish('style', style);
});
