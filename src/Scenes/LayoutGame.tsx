import { Global } from '@emotion/react';
import { GameScreens } from 'Elements/GameScreens';
import Toolbar from 'Toolbar/Toolbar';
import { PropsWithChildren } from 'react';
import styles from 'styles';

interface Props extends PropsWithChildren {
  toolbar?: boolean;
}

function LayoutGame({ children, toolbar = true }: Props) {
  return (
    <GameScreens>
      <Global styles={styles} />
      {toolbar && <Toolbar />}
      {children}
    </GameScreens>
  );
}

export default LayoutGame;
