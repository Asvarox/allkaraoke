import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import WebRTCServer from './WebRTCServer';

function ConnectPhone() {
    useEffect(() => {
        WebRTCServer.start();
    }, []);

    const link = `${window.location.origin}/#/phone/${WebRTCServer.getRoomId()}`;

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
                        <InputCopy disabled value={link} />
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
    margin-top: 0.5em;
`;

const CopyButton = styled.button`
    cursor: pointer;
    position: absolute;
    padding: 0 20px;
    right: 0;
    height: 100%;
    box-sizing: border-box;

    background: ${styles.colors.text.active};

    ${typography};
    font-weight: bold;
    font-size: 0.9em;
    border: 0;

    :active {
        background-color: black;
    }
`;

const InputCopy = styled.input`
    padding: 0.75em;
    box-sizing: border-box;
    background: grey;
    border: none;
    width: 100%;
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
    flex: 0.7;
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
        margin-bottom: 0.75em;
    }
    h4 {
        margin: 0.5em 0;
    }

    ol {
        padding-left: 0.9em;
        margin: 0.5em 0;
        list-style: decimal inside;
    }
    li {
        color: white;
        font-size: 0.75em;
        line-height: 1.6em;
    }
`;

export default ConnectPhone;
