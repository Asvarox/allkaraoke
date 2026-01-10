import styles from 'modules/GameEngine/Drawing/styles';

export const focused = {
  animation: `focusAnimation 1000ms ease-in-out infinite both`,
};

export const focusedStatic = {
  boxShadow: `inset 0px 0px 0px 4px ${styles.colors.text.active}`,
};

export const typography = {
  fontWeight: 'bold',
  WebkitTextStroke: '0.5px black',
  color: 'white',
  '& strong': {
    color: styles.colors.text.active,
  },
};

export const mobileMQ = '@media (hover: none)';
export const desktopMQ = '@media (hover: hover)';

export const landscapeMQ = '  @media (max-height: 500px) and (min-aspect-ratio: 16/10)';
