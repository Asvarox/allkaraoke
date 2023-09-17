import { createContext, PropsWithChildren } from 'react';
import { useCurrentFrame } from 'remotion';

export const AbsoluteFrameContext = createContext({
  frame: 0,
});

export default function AbsoluteFrameProvider({ children }: PropsWithChildren) {
  const frame = useCurrentFrame();

  return <AbsoluteFrameContext.Provider value={{ frame }}>{children}</AbsoluteFrameContext.Provider>;
}
