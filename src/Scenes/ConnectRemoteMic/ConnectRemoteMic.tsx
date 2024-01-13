import styled from '@emotion/styled';
import { focused, typography } from 'Elements/cssMixins';
import RemoteMicServer from 'RemoteMic/Network/Server';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import useQueryParam from 'hooks/useQueryParam';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';
import { useRoute } from 'wouter';

const linkObject = new URL(window.location.href);

function RoomCode({ gameCode, ...props }: { gameCode: string }) {
  return (
    <GameCode {...props}>
      {gameCode.split('').map((letter, i) => (
        <span key={i}>{letter}</span>
      ))}
    </GameCode>
  );
}

function ConnectRemoteMic() {
  // Validate if the component is rendered in a remote mic or in the "main" game via the URL
  const [match] = useRoute('remote-mic');
  const gameCode = useQueryParam('room') ?? RemoteMicServer.getGameCode();
  linkObject.pathname = `${import.meta.env.BASE_URL}remote-mic`;
  linkObject.searchParams.set('room', gameCode);

  const link = linkObject.href;

  useEffect(() => {
    if (!match) {
      RemoteMicServer.start();
    }
  }, [match]);

  return (
    <Container>
      <QRCode>
        <QRCodeSVG value={link} width="100%" height="100%" includeMargin />
      </QRCode>
      <Description>
        <QRCodeInstruction>
          <h3>
            Game code: <RoomCode gameCode={gameCode} data-test="game-code" />
          </h3>
          <ol>
            <li>
              Go to{' '}
              <a href={linkObject.origin} target="_blank" rel="noreferrer">
                allkaraoke.party
              </a>{' '}
              on your phone
            </li>
            <li>
              Click on <b>Join game</b>
            </li>
            <li>
              Enter the code <RoomCode gameCode={gameCode} />
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

const GameCode = styled.strong`
  text-transform: uppercase;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  display: inline-flex;
  gap: 1.5rem;

  ${focused};
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

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const QRCode = styled.div`
  flex: 0.6;
  @media (max-width: 560px) {
    flex: 0;
  }
`;

const Description = styled.div`
  @media (max-width: 560px) {
    display: none;
  }
  flex: 1;

  display: flex;
  flex-direction: column;

  b {
    font-weight: bold;
    ${typography};
    color: ${styles.colors.text.active};
  }

  h3 {
    margin-bottom: 1rem;
  }
  h4 {
    margin: 1rem 0;
  }

  ol {
    padding-left: 2.3rem;
    margin: 0 0 1.25rem 0;
    list-style: decimal inside;
  }
  li {
    color: white;
    font-size: 2rem;
    line-height: 3.2rem;

    ${GameCode} {
      line-height: 1;
    }
  }
`;

export default ConnectRemoteMic;
