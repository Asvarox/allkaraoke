import { switchToTheme } from '~/modules/game-engine/drawing/styles';
import RemoteMicServer from '~/modules/remote-mic/network/server';
import { BackgroundThemeSetting } from '~/routes/settings/settings-state';

BackgroundThemeSetting.addListener((style) => {
  switchToTheme(style);
  RemoteMicServer.publish('style', style);
});
