import { ComponentProps } from 'react';
import { twc } from 'react-twc';
import storage from '~/modules/utils/storage';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/Settings/SettingsState';

import { twx } from '~/utils/twx';

if (global.location?.search.includes('pride')) {
  storage.session.setItem('pride', 'true');
}

export default function Logo(props: ComponentProps<'div'>) {
  //   const isEurovision = false; //useFeatureFlag(FeatureFlags.Eurovision);
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  //   const { theme } = useContext(BackgroundContext);

  if (mobilePhoneMode) {
    return null;
  }
  return (
    <div className="relative h-[1.1em] [view-transition-name:logo]" {...props}>
      <LetterBase>
        <span className="-rotate-2">A</span>
        <span className="rotate-10">l</span>
        <span className="-rotate-4">l</span>
        <span className="text-text-player-0 rotate-4">K</span>
        <span className="-rotate-0">a</span>
        <span className="-rotate-6">r</span>
        <span className="rotate-10">a</span>
        <span className="text-active rotate-2">o</span>
        <span className="rotate-4">k</span>
        <span className="-rotate-16">e</span>
        <DotParty>
          .par<span className="text-text-player-1">t</span>y
        </DotParty>
      </LetterBase>
    </div>
  );
}

const LetterBase = twx.span`typography relative top-[-0.15em] left-[-0.1em] text-[1em] leading-0.5 -tracking-[0.15em] [-webkit-text-stroke:0.02em_black] [font-variant:small-caps] [&_span]:inline-block`;

const DotParty = twc.span`absolute right-[-0.3em] bottom-[0.8em] text-[0.4em] -tracking-[0.1em]`;
