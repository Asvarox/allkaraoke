import { GameScreens } from 'Elements/GameScreens';
import Toolbar from 'Toolbar/Toolbar';
import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  toolbar?: boolean;
}

function LayoutGame({ children, toolbar = true }: Props) {
  return (
    <GameScreens>
      {toolbar && <Toolbar />}
      {children}
    </GameScreens>
  );
}

export default LayoutGame;
