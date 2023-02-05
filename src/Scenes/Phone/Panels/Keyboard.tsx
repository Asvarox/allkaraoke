import styled from '@emotion/styled';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { Games, KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp } from '@mui/icons-material';
import { css } from '@emotion/react';

export default function PhoneKeyboard() {
    return (
        <Container>
            <ArrowsContainer>
                <ArrowButton onClick={() => WebRTCClient.sendKeyStroke('up')}>
                    <KeyboardArrowUp />
                </ArrowButton>
                <Break />
                <ArrowButton onClick={() => WebRTCClient.sendKeyStroke('left')}>
                    <KeyboardArrowLeft />
                </ArrowButton>
                <ArrowButton disabled>
                    <Games />
                </ArrowButton>
                <ArrowButton onClick={() => WebRTCClient.sendKeyStroke('right')}>
                    <KeyboardArrowRight />
                </ArrowButton>
                <Break />
                <ArrowButton onClick={() => WebRTCClient.sendKeyStroke('down')}>
                    <KeyboardArrowDown />
                </ArrowButton>
            </ArrowsContainer>
            <ActionsContainer>
                <ActionButton onClick={() => WebRTCClient.sendKeyStroke('Backspace')}>Back</ActionButton>
                <ActionButton onClick={() => WebRTCClient.sendKeyStroke('Enter')}>Enter</ActionButton>
            </ActionsContainer>
            <Break />
            <ActionsContainer>
                <ActionButton onClick={() => WebRTCClient.sendKeyStroke('Shift+R')}>Random Song</ActionButton>
            </ActionsContainer>
        </Container>
    );
}

const Container = styled.div`
    gap: 1rem;
    display: flex;
    flex-wrap: wrap;
`;
const ArrowsContainer = styled.div`
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    flex: 1;
    color: white;
    font-size: 2rem;
`;

const ActionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-between;
`;

const Break = styled.div`
    flex-basis: 100%;
    height: 0;
`;

const ButtonBase = styled.button<{ disabled?: boolean }>`
    background: none;
    border: none;
    box-sizing: border-box;
    margin: 0.25rem;
    width: 4.5rem;
    height: 4.5rem;

    svg {
        width: 2.5rem;
        height: 2.5rem;
    }

    opacity: ${(props) => (props.disabled ? 0.25 : 1)};
`;

const ArrowButton = styled(ButtonBase)<{ disabled?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.3rem;
    border: 0.3rem solid rgb(204, 204, 204);
    border-bottom-color: rgb(130, 130, 130);
    border-right-color: rgb(130, 130, 130);

    ${(props) =>
        !props.disabled
            ? css`
                  cursor: pointer;
                  &:active {
                      border: 0.3rem solid rgb(130, 130, 130);
                      border-bottom-color: rgb(204, 204, 204);
                      border-right-color: rgb(204, 204, 204);
                  }
              `
            : ''}

    color: rgb(51, 51, 51);
    font-weight: normal;
    font-size: 2.5rem;
    box-shadow: 0 0.1rem 0 rgba(0, 0, 0, 0.2), inset 0 0 0 0.2rem #ffffff;
    background-color: rgb(247, 247, 247);
    text-shadow: 0 0.1rem 0 #fff;
`;

const ActionButton = styled(ArrowButton)<{ disabled?: boolean }>`
    width: 100%;
`;
