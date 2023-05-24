import styled from '@emotion/styled';
import { Warning } from '@mui/icons-material';
import { PropsWithChildren, ReactNode } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import enableMic from './enable-mic.png';
import enableMicOpera from './enable-mic-opera.png';
import allowMic from './allow-mic.png';
import { useMicrophoneStatus } from 'UserMedia/hooks';
import isOpera from 'utils/isOpera';

const getProperEnableMicImage = () => (isOpera() ? enableMicOpera : enableMic);

interface Props extends PropsWithChildren {
    fallback: ReactNode;
    showImages?: boolean;
}
const UserMediaEnabled = ({ children, fallback, showImages = true }: Props) => {
    const status = useMicrophoneStatus();
    return (
        <>
            {status === 'accepted' && children}
            {status !== 'accepted' && (
                <>
                    <WarningContainer>
                        <WarningIcon />
                    </WarningContainer>
                    {fallback}
                    <AdditionalInfo>
                        {status === 'requested' && showImages && <img src={allowMic} alt="how-to-allow" />}
                        {status === 'declined' && (
                            <>
                                <h3>Access is blocked, you can unblock it here</h3>
                                {showImages && <img src={getProperEnableMicImage()} alt="how-to-enable" />}
                            </>
                        )}
                        {isOpera() && (
                            <h4>
                                <strong>Opera</strong> is buggy regarding microphone access - if you encounter issue
                                (e.g. this message stays even after the access to microphone was granted), consider
                                other browsers.
                            </h4>
                        )}
                    </AdditionalInfo>
                </>
            )}
        </>
    );
};

const AdditionalInfo = styled.div`
    text-align: center;

    img {
        margin: 1.5rem 0 0.5rem;
        box-shadow: 0.5rem 0.5rem 0.5rem rgba(0, 0, 0, 0.5), inset 0 0 0.5rem 0.5rem rgba(255, 255, 255, 0.5);
        border: 0.5rem solid white;
        border-radius: 1rem;
        box-sizing: border-box;
        max-width: 100%;
    }
`;

const WarningContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;
const WarningIcon = styled(Warning)`
    color: ${styles.colors.text.active};
    font-size: 3rem;
`;
export default UserMediaEnabled;
