import { useEffect } from 'react';

interface Props {
    onSetupComplete: (complete: boolean) => void;
    onBack: () => void;
    onSave: () => void;
    closeButtonText: string;
}

function Skip(props: Props) {
    useEffect(() => {
        props.onSave();
    }, []);

    return null;
}

export default Skip;
