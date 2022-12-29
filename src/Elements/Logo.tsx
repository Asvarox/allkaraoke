import logo from "Elements/logo.gif";
import pride from "Elements/pride.png";
import styled from "@emotion/styled";

export default function Logo(props: any) {
    return (<Container>
        {window.location.host === 'konfederacja.gay' && <PrideLogo src={pride} alt="AllKaraoke Pride logo" />}
        <StyledLogo src={logo} alt="AllKaraoke logo" {...props} />

    </Container>);
}
const StyledLogo = styled.img``;

const Container = styled.div`
    position: relative;
    `;

const PrideLogo = styled.img` position: absolute;`;
