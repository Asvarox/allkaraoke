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
import { twx } from 'utils/twx';

if (global.location?.search.includes('pride')) {
  storage.session.setItem('pride', 'true');
}

export default function Logo(props: ComponentProps<'div'>) {
  const isEurovision = false; //useFeatureFlag(FeatureFlags.Eurovision);
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const { theme } = useContext(BackgroundContext);

  if (mobilePhoneMode) {
    return null;
  }
  return (
    <div className="relative h-[1.1em] [view-transition-name:logo]" {...props}>
      <LetterBase>
        <span className="-rotate-2">A</span>
        <span className="rotate-10">l</span>
        <span className="-rotate-4">l</span>
        <span className="rotate-4">K</span>
        <span className="-rotate-4">a</span>
        <span className="-rotate-6">r</span>
        <span className="rotate-10">a</span>
        <span className="rotate-2">o</span>
        <span className="rotate-4">k</span>
        <span className="-rotate-16">e</span>
      <DotParty>.party</DotParty>
      </LetterBase>
    </div>
  );
}

const LetterBase = twx.span`typography relative top-[-0.15em] left-[-0.1em] text-[1em] leading-0.5 -tracking-[0.15em] [-webkit-text-stroke:0.02em_black] [font-variant:small-caps] [&_span]:inline-block`;

const DotParty = twc.span`text-[0.4em] -tracking-[0.1em] absolute bottom-[0.8em] right-[-0.3em]`;