import logo from 'Elements/logo.gif';
import styled from '@emotion/styled';

export default function Logo(props: any) {
    return <StyledLogo src={logo} alt="Olkaraoke logo" {...props} />;
}
const StyledLogo = styled.img``;
