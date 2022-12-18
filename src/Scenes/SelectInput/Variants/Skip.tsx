import useKeyboardNav from 'hooks/useKeyboardNav';
import { MenuButton } from 'Elements/Menu';
import styled from '@emotion/styled';

interface Props {
    onBack: () => void;
    onSave: () => void;
    closeButtonText: string;
}

function Skip(props: Props) {
    const { register } = useKeyboardNav({ onBackspace: props.onBack });

    const onContinue = () => {
        props.onSave();
    };

    return (
        <>
            <Heading>Skip - go straight to the game</Heading>
            <h4>
                You can always setup in <strong>Setup Microphones</strong> or once you select a song.
            </h4>

            <MenuButton {...register('back', props.onBack)} data-test="back-button">
                Back
            </MenuButton>
            <MenuButton {...register('Sing a song', onContinue, undefined, true)} data-test="save-button">
                {props.closeButtonText}
            </MenuButton>
        </>
    );
}

const Heading = styled.h3`
    text-align: center;
`;

export default Skip;
