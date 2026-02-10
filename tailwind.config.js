const styles = require('./src/modules/GameEngine/Drawing/styles');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.9rem',
      base: '1rem',
      md: '1.25rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '3.5rem',
      '5xl': '4rem',
      '6xl': '10rem',
    },
    extend: {
      boxShadow: {
        focusable: 'inset 0 0 0 1px rgba(255,165,0,.25)',
      },
      colors: {
          'default': styles.colors.text.default,
          'inactive': styles.colors.text.inactive,
        text: {
          'player-0': styles.colors.players[0].text,
          'player-0-christmas': styles.colorSets.christmasGreen.text,
          'player-1': styles.colors.players[1].text,
          'player-1-christmas': styles.colorSets.christmasRed.text,
          error: 'red',
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
            transform: 'scale(1.020)',
          },
          '50%': {
            transform: 'scale(1.030)',
          },
        },
        logoPulse: {
          '0%': {
            transform: 'scale(1)',
          },
          '33%': {
            transform: 'scale(1.05)',
          },
          '66%': {
            transform: 'scale(1)',
          },
          '100%': {
            transform: 'scale(1)',
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
        'lyrics-pop': {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '10%': {
            transform: 'scale(1.15)',
          },
        },
        'lyrics-shake': {
          '10%, 90%': {
            transform: 'translate3d(-0.1rem, 0, 0)',
          },
          '20%, 80%': {
            transform: 'translate3d(0.2rem, 0, 0)',
          },
          '30%, 50%, 70%': {
            transform: 'translate3d(-0.4rem, 0, 0)',
          },
          '40%, 60%': {
            transform: 'translate3d(0.4rem, 0, 0)',
          },
        },
      },
      animation: {
        blink: 'blink 1050ms ease-in-out infinite both',
        'calibrate-pulse': 'calibrationPulse 1.5s ease 1',
        gradient: 'gradient 15s ease infinite',
        focused: 'focused 1000ms ease-in-out infinite both',
        'button-focused': 'buttonFocused 600ms ease-in-out infinite both',
        'logo-pulse': 'logoPulse 1.25s infinite',
        'lyrics-pop': 'lyrics-pop 500ms ease-in-out 0s 1 both',
        'lyrics-shake': 'lyrics-shake 0.92s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0s infinite both',
      },
      screens: {
        mobile: {
          raw: '(max-width: 900px)',
        },
        landscap: {
          raw: '(max-height: 500px) and (min-aspect-ratio: 16/10)',
        },
      },
    },
  },
  plugins: [],
};
