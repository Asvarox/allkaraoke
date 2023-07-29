import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import { useEffect, useState } from 'react';

interface Props {}

function RemoteInputLag({}: Props) {
    const [currentValue, setCurrentValue] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        WebRTCClient.getInputLag()
            .then(({ value }) => setCurrentValue(value))
            .finally(() => setIsLoading(false));
    }, []);

    const changeValue = (change: number) => {
        setIsLoading(true);
        WebRTCClient.setInputLag(currentValue + change)
            .then(({ value }) => setCurrentValue(value))
            .finally(() => setIsLoading(false));
    };

    return (
        <>
            <h3>Adjust input lag</h3>
            <Container>
                <Button onClick={() => changeValue(-50)} disabled={isLoading}>
                    -
                </Button>
                <Value>
                    <strong>{currentValue}</strong>ms
                </Value>
                <Button onClick={() => changeValue(+50)} disabled={isLoading}>
                    +
                </Button>
            </Container>
        </>
    );
}
export default RemoteInputLag;

const Button = styled.button`
    background: black;
    padding: 1rem 2rem;
    border: none;
    font-size: 3rem;
    ${typography};
    :disabled {
        opacity: 0.5;
    }
`;

const Value = styled.div`
    flex: 1;
    text-align: center;
`;
const Container = styled.div`
    ${typography};
    display: flex;
    align-items: center;
    justify-self: center;
    background: black;
`;
