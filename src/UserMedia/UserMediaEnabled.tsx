import styled from '@emotion/styled';
import { Warning } from '@mui/icons-material';
import { PropsWithChildren, ReactNode } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import enableMic from './enable-mic.png';
import allowMic from './allow-mic.png';
import { useMicrophoneStatus } from 'UserMedia/hooks';

interface Props extends PropsWithChildren {
    fallback: ReactNode;
    showImages?: boolean;
}
const UserMediaEnabled = ({ children, fallback, showImages }: Props) => {
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
                                {showImages && <img src={enableMic} alt="how-to-enable" />}
                            </>
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
        margin: 0.5em;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
    }
`;

const WarningContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;
const WarningIcon = styled(Warning)`
    color: ${styles.colors.text.active};
    font-size: 3em;
`;
export default UserMediaEnabled;
