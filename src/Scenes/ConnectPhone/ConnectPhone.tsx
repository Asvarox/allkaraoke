import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import WebRTCServer from './WebRTCServer';

const linkObject = new URL(window.location.href);
linkObject.hash = `/phone/${WebRTCServer.getRoomId()}`;

const link = linkObject.href;

function ConnectPhone() {
    useEffect(() => {
        WebRTCServer.start();
    }, []);

    return (
        <Container>
            <QRCode>
                <QRCodeSVG value={link} width="100%" height="100%" includeMargin />
            </QRCode>
            <Description>
                <QRCodeInstruction>
                    <h3>Use your phone as a microphone</h3>
                    <ol>
                        <li>
                            Open <b>Camera App</b> on your phone
                        </li>
                        <li>
                            Point the camera to the <b>QR Code</b> on the left
                        </li>
                        <li>
                            Open <b>the link</b> that should appear
                        </li>
                        <li>Follow the instructions</li>
                    </ol>
                </QRCodeInstruction>
                <CopyLinkInstruction>
                    <h4>Or copy and send the link</h4>
                    <InputCopyContainer>
                        <InputCopy disabled value={link} data-test="server-link-input" />
                        <CopyButton
                            onClick={() => {
                                navigator.clipboard.writeText(link);
                            }}>
                            Copy
                        </CopyButton>
                    </InputCopyContainer>
                </CopyLinkInstruction>
            </Description>
        </Container>
    );
}
const QRCodeInstruction = styled.div`
    flex: 1;
`;

const CopyLinkInstruction = styled.div`
    flex: 0;
`;

const InputCopyContainer = styled.div`
    position: relative;
    margin-top: 0.5rem;
`;

const CopyButton = styled.button`
    cursor: pointer;
    position: absolute;
    padding: 0 2rem;
    right: 0;
    height: 100%;
    box-sizing: border-box;

    background: ${styles.colors.text.active};

    ${typography};
    font-weight: bold;
    font-size: 2.2rem;
    border: 0;

    :active {
        background-color: black;
    }
`;

const InputCopy = styled.input`
    padding: 1rem;
    box-sizing: border-box;
    background: grey;
    border: none;
    width: 100%;
    font-size: 1.3rem;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
    flex: 1;
    gap: 2%;
`;

const QRCode = styled.div`
    flex: 0.6;
`;

const Description = styled.div`
    flex: 1;

    display: flex;
    flex-direction: column;

    b {
        font-weight: bold;
        ${typography};
        color: ${styles.colors.text.active};
    }

    h3 {
        margin-bottom: 1.9rem;
    }
    h4 {
        margin: 1.25rem 0;
    }

    ol {
        padding-left: 2.3rem;
        margin: 1.25rem 0;
        list-style: decimal inside;
    }
    li {
        color: white;
        font-size: 1.9rem;
        line-height: 3.2rem;
    }
`;

export default ConnectPhone;
