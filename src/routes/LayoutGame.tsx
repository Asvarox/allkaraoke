import { GameScreens } from 'modules/Elements/GameScreens';
import Toolbar from 'modules/Toolbar/Toolbar';
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
