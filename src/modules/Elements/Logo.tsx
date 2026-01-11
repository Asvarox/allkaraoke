import dotparty from 'modules/Elements/dotparty.gif';
import logoMp4 from 'modules/Elements/logo.mp4';
import logoWebm from 'modules/Elements/logo.webm';
import santaHat from 'modules/Elements/santas-hat.webp';
import storage from 'modules/utils/storage';
import { ComponentProps, useContext } from 'react';
import { twc } from 'react-twc';
import { MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';

import { BackgroundContext } from 'modules/Elements/BackgroundContext';
import eurovisionIcon from 'routes/SingASong/SongSelection/Components/SongCard/eurovision-icon.svg';
import { EurovisionLogo } from 'routes/SingASong/SongSelection/Hooks/usePlaylistsEurovision';

if (global.location?.search.includes('pride')) {
  storage.session.setItem('pride', 'true');
}

export default function Logo(props: ComponentProps<typeof StyledLogo>) {
  const isEurovision = false; //useFeatureFlag(FeatureFlags.Eurovision);
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const { theme } = useContext(BackgroundContext);

  if (mobilePhoneMode) {
    return null;
  }
  return (
    <div className="relative h-[1.1em] [view-transition-name:logo]">
      <StyledLogo {...props} autoPlay loop muted playsInline>
        <source src={logoWebm} type="video/webm" />
        <source src={logoMp4} type="video/mp4" />
      </StyledLogo>
      <img className="absolute right-[-0.1em] bottom-0 h-[0.3em]" src={dotparty} alt="AllKaraoke Pride logo part 2" />
      {theme === 'christmas' && (
        <img
          className="absolute top-[-0.3em] right-[-0.55em] h-[1.1em] w-[1.1em] rotate-[30deg] object-contain"
          src={santaHat}
          alt="AllKaraoke Pride logo part 2"
        />
      )}
      {isEurovision && (
        <EurovisionLogo src={eurovisionIcon} className="absolute top-[0.15em] right-[-1em] h-[0.9em]! object-contain" />
      )}
    </div>
  );
}

const StyledLogo = twc.video`h-[1.1em] w-[4em]`;
