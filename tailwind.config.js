/** @type {import('tailwindcss').Config} */
const styles = require('./src/modules/GameEngine/Drawing/styles');
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        text: {
          default: styles.colors.text.default,
          active: styles.colors.text.active,
          inactive: styles.colors.text.active,
        },
        active: styles.colors.text.active,
      },
      keyframes: {
        focused: {
          '0%, 100%': {
            'box-shadow': `inset 0px 0px 0px 2px ${styles.colors.text.active}`,
          },
          '50%': {
            'box-shadow': `inset 0px 0px 0px 4px ${styles.colors.text.active}`,
          },
        },
      },
      animation: {
        focused: 'focused 1000ms ease-in-out infinite both',
      },
    },
  },
  plugins: [],
};
