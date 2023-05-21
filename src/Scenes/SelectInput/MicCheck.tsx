import styled from '@emotion/styled';
import { PlayerMicCheck } from 'Elements/VolumeIndicator';

interface Props {
    names: [string, string];
}

function MicCheck(props: Props) {
    return (
        <MicCheckContainer>
            <Indicator data-test="mic-check-p0">
                <PlayerMicCheck playerNumber={0} />
                {props.names[0]}
            </Indicator>
            <Indicator data-test="mic-check-p1">
                <MirrorMicCheck playerNumber={1} />
                {props.names[1]}
            </Indicator>
        </MicCheckContainer>
    );
}

const MicCheckContainer = styled.div`
    display: flex;
    gap: 1.25rem;

    div {
        flex: 1;
    }
`;

const Indicator = styled.div`
    position: relative;
    border: 0.1rem solid white;
    padding: 1rem 3rem;
    background: black;

    text-align: center;
    gap: 1.25rem;
    font-size: 2.3rem;
    color: white;
`;

const MirrorMicCheck = styled(PlayerMicCheck)`
    rotate: 180deg;
    translate: -100% 0;
`;

export default MicCheck;
