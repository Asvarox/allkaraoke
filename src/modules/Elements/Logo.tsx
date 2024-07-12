import dotparty from 'modules/Elements/dotparty.gif';
import logoMp4 from 'modules/Elements/logo.mp4';
import logoWebm from 'modules/Elements/logo.webm';
import pride from 'modules/Elements/pride.png';
import storage from 'modules/utils/storage';
import { ComponentProps } from 'react';
import { twc } from 'react-twc';
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
    <div className="relative h-[16.4rem] [view-transition-name:logo]">
      {storage.session.getItem('pride') === 'true' && (
        <StyledLogo asChild>
          <img className="absolute" src={pride} alt="AllKaraoke Pride logo part 1" />
        </StyledLogo>
      )}
      <StyledLogo {...props} autoPlay loop muted playsInline>
        <source src={logoWebm} type="video/webm" />
        <source src={logoMp4} type="video/mp4" />
      </StyledLogo>
      <img
        className="absolute w-[13.7rem] h-[5.1rem] bottom-[-0.5rem] right-[-1rem]"
        src={dotparty}
        alt="AllKaraoke Pride logo part 2"
      />
    </div>
  );
}

const StyledLogo = twc.video`w-[66rem] h-[16.4rem]`;
