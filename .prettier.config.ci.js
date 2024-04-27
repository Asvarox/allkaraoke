const baseConfig = require('./.prettierrc.json');

module.exports = {
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins ?? []),
    // https://github.com/prettier/prettier/issues/15513
    'prettier-plugin-organize-imports',
  ],
};
