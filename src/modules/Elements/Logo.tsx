import styled from '@emotion/styled';
import dotparty from 'modules/Elements/dotparty.gif';
import logoMp4 from 'modules/Elements/logo.mp4';
import logoWebm from 'modules/Elements/logo.webm';
import pride from 'modules/Elements/pride.png';
import storage from 'modules/utils/storage';
import { ComponentProps } from 'react';
import { MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';

if (global.location?.search.includes('pride')) {
  storage.session.setItem('pride', 'true');
}

export default function Logo(props: ComponentProps<typeof StyledLogo>) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

  if (mobilePhoneMode) {
    return null;
  }
  return (
    <Container>
      {storage.session.getItem('pride') === 'true' && (
        // @ts-expect-error
        <PrideLogo as="img" src={pride} alt="AllKaraoke Pride logo part 1" />
      )}
      <StyledLogo {...props} autoPlay loop muted playsInline>
        <source src={logoWebm} type="video/webm" />
        <source src={logoMp4} type="video/mp4" />
      </StyledLogo>
      <DotParty src={dotparty} alt="AllKaraoke Pride logo part 2" />
    </Container>
  );
}
const StyledLogo = styled.video`
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
