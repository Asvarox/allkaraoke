import { useContext } from 'react';
import { AbsoluteFrameContext } from 'videos/support/AbsoluteFrame/Provider';

export default function useAbsoluteFrame() {
    const context = useContext(AbsoluteFrameContext);

    return context.frame;
}
