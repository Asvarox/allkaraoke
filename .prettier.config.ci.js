const baseConfig = require("./.prettier.config.js");

module.exports = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), "prettier-plugin-organize-imports"],
};
