// See all configuration options: https://remotion.dev/docs/config
import path from 'node:path';
import { Config } from 'remotion';

Config.setImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((config) => ({
    ...config,
    resolve: {
        ...config.resolve,
        // Allows absolute imports, process.cwd() used as (due to Yarn PnP) __dirname is somewhere deep in .yarn folder
        modules: [path.resolve(process.cwd(), 'src'), 'node_modules'],
    },
}));
Config.setChromiumDisableWebSecurity(true);
