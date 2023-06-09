import { AbsoluteFrameContext } from 'videos/support/AbsoluteFrame/Provider';
import { useContext } from 'react';

export default function useAbsoluteFrame() {
    const context = useContext(AbsoluteFrameContext);

    return context.frame;
}
