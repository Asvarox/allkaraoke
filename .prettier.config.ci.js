const baseConfig = require('./.prettierrc.json');

module.exports = {
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins ?? []),
    // https://github.com/prettier/prettier/issues/15513
    '.yarn/unplugged/prettier-plugin-organize-imports-virtual-ffc734fe8a/node_modules/prettier-plugin-organize-imports',
  ],
};
