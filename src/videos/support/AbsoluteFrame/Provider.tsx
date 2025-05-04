import { createContext, PropsWithChildren } from 'react';
import { useCurrentFrame } from 'remotion';

// eslint-disable-next-line react-refresh/only-export-components
export const AbsoluteFrameContext = createContext({
  frame: 0,
});

export default function AbsoluteFrameProvider({ children }: PropsWithChildren) {
  const frame = useCurrentFrame();

  return <AbsoluteFrameContext.Provider value={{ frame }}>{children}</AbsoluteFrameContext.Provider>;
}
