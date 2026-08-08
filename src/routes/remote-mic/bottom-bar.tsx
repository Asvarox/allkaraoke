import { twc, TwcComponentProps } from 'react-twc';
import { twMerge } from 'tailwind-merge';

import { Icon } from '~/modules/elements/akui/icon';
import { MicIcon } from '~/modules/elements/mic-icon';
import { PhoneTabs } from '~/routes/remote-mic/remote-mic';

interface Props {
  active: PhoneTabs;
  setActiveTab: (active: PhoneTabs) => void;
  className?: string;
}

export default function BottomBar({ active, setActiveTab, className }: Props) {
  return (
    // Portrait: horizontal bar pinned to the bottom. Landscape: vertical rail on the left side
    // (the mic view turns into two columns there, so a bottom bar would eat the scarce height).
    <div
      className={twMerge(
        'right-0 bottom-0 flex w-full origin-bottom-right items-stretch gap-[1px] bg-slate-700 landscape:h-full landscape:w-24 landscape:flex-col landscape:justify-end landscape:bg-black',
        className,
      )}>
      <ItemContainer
        $active={active === 'microphone'}
        onClick={() => setActiveTab('microphone')}
        data-test="menu-microphone">
        <ItemIcon>
          <MicIcon />
        </ItemIcon>
        <ItemTitle>Microphone</ItemTitle>
      </ItemContainer>
      <ItemContainer
        $active={active === 'song-list'}
        onClick={() => setActiveTab('song-list')}
        data-test="menu-song-list">
        <ItemIcon>
          <Icon icon="ic:baseline-list" size={6} />
        </ItemIcon>
        <ItemTitle>Song list</ItemTitle>
      </ItemContainer>
      <ItemContainer $active={active === 'settings'} onClick={() => setActiveTab('settings')} data-test="menu-settings">
        <ItemIcon>
          <Icon icon="ic:baseline-settings" size={6} />
        </ItemIcon>
        <ItemTitle>Settings</ItemTitle>
      </ItemContainer>
    </div>
  );
}

const ItemContainer = twc.div<{ $active?: boolean } & TwcComponentProps<'div'>>((props) =>
  [
    'flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 border-t-2 bg-black p-1 text-xs landscape:flex-none landscape:gap-2 landscape:border-t-0 landscape:border-l-2 landscape:py-4',
    props.$active ? 'text-active border-active' : 'border-transparent text-[#cecece]',
  ].join(' '),
);

const ItemIcon = twc.div`[&_svg]:h-6 [&_svg]:w-6`;
const ItemTitle = twc.div``;
