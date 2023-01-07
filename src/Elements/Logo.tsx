import logo from 'Elements/logo.gif';
import pride from 'Elements/pride.png';
import styled from '@emotion/styled';

export default function Logo(props: any) {
    return (
        <Container>
            {window.location.search.includes('pride') && <PrideLogo src={pride} alt="AllKaraoke Pride logo" />}
            <StyledLogo src={logo} alt="AllKaraoke logo" {...props} />
        </Container>
    );
}
const StyledLogo = styled.img`
    width: 66rem;
    height: 16.4rem;
`;

const Container = styled.div`
    position: relative;
    height: 16.4rem;
`;

const PrideLogo = styled.img`
    position: absolute;
`;
