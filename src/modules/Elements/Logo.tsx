import dotparty from 'modules/Elements/dotparty.gif';
import { BackgroundContext } from 'modules/Elements/LayoutWithBackground';
import logoMp4 from 'modules/Elements/logo.mp4';
import logoWebm from 'modules/Elements/logo.webm';
import pride from 'modules/Elements/pride.png';
import santaHat from 'modules/Elements/santas-hat.webp';
import storage from 'modules/utils/storage';
import { ComponentProps, useContext } from 'react';
import { twc } from 'react-twc';
import { MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';

if (global.location?.search.includes('pride')) {
  storage.session.setItem('pride', 'true');
}

export default function Logo(props: ComponentProps<typeof StyledLogo>) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const { theme } = useContext(BackgroundContext);

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
        className="absolute bottom-[-0.5rem] right-[-1rem] h-[5.1rem] w-[13.7rem]"
        src={dotparty}
        alt="AllKaraoke Pride logo part 2"
      />
      {theme === 'christmas' && (
        <img
          className="absolute right-[-7rem] top-[-3rem] h-[11.1rem] w-[13.7rem] rotate-[30deg] object-contain"
          src={santaHat}
          alt="AllKaraoke Pride logo part 2"
        />
      )}
    </div>
  );
}

const StyledLogo = twc.video`w-[66rem] h-[16.4rem]`;
