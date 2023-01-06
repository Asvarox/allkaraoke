import styled from '@emotion/styled';
import VolumeIndicator from 'Scenes/Game/VolumeIndicator';

interface Props {
    names: [string, string];
}

function MicCheck(props: Props) {
    return (
        <MicCheckContainer>
            <VolumeIndicator playerNumber={0} data-test="mic-check-p1">
                {props.names[0]}
            </VolumeIndicator>
            <VolumeIndicator playerNumber={1} data-test="mic-check-p2">
                {props.names[1]}
            </VolumeIndicator>
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

export default MicCheck;
