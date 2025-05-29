const styles = require('./src/modules/GameEngine/Drawing/styles');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      xs: '1rem',
      sm: '1.5rem',
      base: '2rem',
      md: '2.5rem',
      lg: '3rem',
      xl: '4rem',
      '2xl': '1.563rem',
      '3xl': '1.953rem',
      '4xl': '2.441rem',
      '5xl': '3.052rem',
      '5xl': '10rem',
    },
    extend: {
      boxShadow: {
        focusable: 'inset 0 0 0 1px rgba(255,165,0,.25)',
      },
      colors: {
        text: {
          default: styles.colors.text.default,
          active: styles.colors.text.active,
          inactive: styles.colors.text.inactive,
          'player-0': styles.colors.players[0].text,
          'player-0-christmas': styles.colorSets.christmasGreen.text,
          'player-1': styles.colors.players[1].text,
          'player-1-christmas': styles.colorSets.christmasRed.text,
        },
        active: styles.colors.text.active,
      },
      keyframes: {
        gradient: {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
        focused: {
          '0%, 100%': {
            'box-shadow': `inset 0px 0px 0px 2px ${styles.colors.text.active}`,
          },
          '50%': {
            'box-shadow': `inset 0px 0px 0px 4px ${styles.colors.text.active}`,
          },
        },
        buttonFocused: {
          '0%, 100%': {
            transform: 'scale(1.045)',
          },
          '50%': {
            transform: 'scale(1.055)',
          },
        },
        calibrationPulse: {
          '0%': {
            transform: 'scale(1)',
          },
          '50%, 100%': {
            transform: 'scale(0)',
          },
        },
        blink: {
          '100%': {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
          },
          '30%': {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
          },
          '50%': {
            backgroundColor: 'rgba(200, 200, 200, 0.85)',
          },
          '0%': {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
          },
        },
      },
      animation: {
        blink: 'blink 1050ms ease-in-out infinite both',
        'calibrate-pulse': 'calibrationPulse 1.5s ease 1',
        gradient: 'gradient 15s ease infinite',
        focused: 'focused 1000ms ease-in-out infinite both',
        'button-focused': 'buttonFocused 600ms ease-in-out infinite both',
      },
      screens: {
        mobile: {
          raw: '(hover: none) and (pointer: coarse)',
        },
        landscap: {
          raw: '(max-height: 500px) and (min-aspect-ratio: 16/10)',
        },
      },
    },
  },
  plugins: [],
};
