const baseConfig = require('./.prettierrc.json');

module.exports = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), 'prettier-plugin-organize-imports'],
};
