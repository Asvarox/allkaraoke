import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';

function RecommendedBrowsers() {
    return (
        <>
            {
                // @ts-expect-error
                !window.chrome && (
                    <RecommendChrome>
                        <h2>
                            This game works best in <strong>Google Chrome</strong> (and Chromium based browsers).
                        </h2>
                        It will not likely work properly on other browsers (like the one you use right now if you see
                        this message).
                    </RecommendChrome>
                )
            }
        </>
    );
}

const RecommendChrome = styled.div`
    width: 750px;
    ${typography};

    strong {
        color: ${styles.colors.text.active};
    }
`;

export default RecommendedBrowsers;
