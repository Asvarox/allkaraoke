import '../src/index.css';
import { GameScreens } from '../src/modules/Elements/GameScreens';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => {
    return (
      <>
        <GameScreens>
          <Story />
        </GameScreens>
      </>
    );
  },
];
