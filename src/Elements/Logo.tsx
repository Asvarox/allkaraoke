import styled from '@emotion/styled';
import dotparty from 'Elements/dotparty.gif';
import logo from 'Elements/logo.gif';
import pride from 'Elements/pride.png';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

if (window.location.search.includes('pride')) {
  sessionStorage.setItem('pride', 'true');
}

export default function Logo(props: any) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

  if (mobilePhoneMode) {
    return null;
  }
  return (
    <Container>
      {sessionStorage.getItem('pride') === 'true' && <PrideLogo src={pride} alt="AllKaraoke Pride logo part 1" />}
      <StyledLogo src={logo} alt="AllKaraoke logo" {...props} />
      <DotParty src={dotparty} alt="AllKaraoke Pride logo part 2" />
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
  view-transition-name: logo;
`;

const PrideLogo = styled(StyledLogo)`
  position: absolute;
`;

const DotParty = styled.img`
  position: absolute;
  width: 13.7rem;
  height: 5.1rem;
  bottom: -0.5rem;
  right: -1rem;
`;
