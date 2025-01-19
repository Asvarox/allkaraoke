const baseConfig = require('./.prettierrc.json');

module.exports = {
  ...baseConfig,
  plugins: ['prettier-plugin-organize-imports', ...(baseConfig.plugins ?? [])],
};
