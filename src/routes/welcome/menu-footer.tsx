import { useContext } from 'react';
import { twc } from 'react-twc';

import { Icon, IconName } from '~/modules/elements/akui/icon';
import { KeyboardHelpList } from '~/routes/keyboard-help/help-view';
import { KeyboardHelpContext } from '~/routes/keyboard-help/keyboard-help-context';
import { KeyboardHelpVisibilitySetting, useSettingValue } from '~/routes/settings/settings-state';

const socials: Array<{ name: string; icon: IconName; href: string }> = [
  { name: 'Facebook', icon: 'cib:facebook', href: 'https://www.facebook.com/allkaraoke.party' },
  { name: 'Instagram', icon: 'cib:instagram', href: 'https://www.instagram.com/allkaraoke.party' },
  { name: 'Github', icon: 'cib:github', href: 'https://github.com/Asvarox/allkaraoke' },
];

/**
 * The strip under the menu grid: contact links on the left, the background music's attribution on
 * the right. Neither is keyboard-navigable — they're read-only credits and mouse-only links, and
 * putting them in the arrow order would make the tiles harder to reach on a TV.
 */
function MenuFooter() {
  const [isHelpVisible, setIsHelpVisible] = useSettingValue(KeyboardHelpVisibilitySetting);
  // The menu asks for `placement: 'inline'`, so the floating corner panel renders nothing and the key
  // list is ours to draw — it would otherwise land on top of the leaderboard rail.
  const { help, hasContent } = useContext(KeyboardHelpContext);

  return (
    <footer className="typography mobile:gap-4 relative flex flex-wrap items-end justify-between gap-8 border-t border-white/10 pt-3 text-white/55">
      <div className="flex flex-col gap-2">
        <SectionLabel>Get in touch</SectionLabel>
        <div className="flex items-center gap-4 text-lg">
          {socials.map(({ name, icon, href }) => (
            <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} className="flex">
              <Icon icon={icon} />
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {/* Same attribution the menu has always carried, kept as its own view-transition target so it
            doesn't slide across the screen on the way in and out of the menu. */}
        <div className="flex flex-col items-end gap-1 text-right text-xs [view-transition-name:background-music-credit]">
          <span>
            Bpm data and release year provided by{' '}
            <a target="_blank" href="https://getsongbpm.com/" rel="noreferrer">
              GetSongBPM
            </a>
          </span>
          <span>
            Song: Funk Cool Groove (Music Today 80) • Composed &amp; Produced by : Anwar Amr •{' '}
            <a href="https://youtu.be/FGzzBbYRjFY" target="_blank" rel="noreferrer">
              Video Link
            </a>
          </span>
        </div>
        {/* The keyboard help, anchored to the footer instead of the top-right corner. Same setting and
            same Shift+H hotkey as everywhere else (see `help-view.tsx`) — but said out loud here,
            because the corner button alone never told anyone the key exists. Hidden below `lg` for the
            same reason as the corner panel: there is no keyboard to help with on a phone. */}
        {/* Its own test id, not the corner panel's `help-container`: this wrapper is always mounted
            (the popover inside it is what appears and disappears), so the two aren't interchangeable. */}
        <div className="hidden lg:block" data-test="menu-keyboard-help">
          {/* Anchored to the whole footer, not to the button: above the button alone it would sit on
              top of the credits next to it. Scaled down rather than restyled — the rows are the shared
              `KeyboardHelpList` ones, and the corner panel shrinks them the same way. It reaches over
              the bottom of the grid, so it takes no pointer events: the tile underneath stays
              clickable, and the toggle below is what dismisses it. */}
          {isHelpVisible && hasContent && (
            <div className="pointer-events-none absolute right-0 bottom-[calc(100%+0.5rem)] flex w-max origin-bottom-right scale-75 flex-col gap-2 rounded-lg border border-white/10 bg-black/85 p-3 [&_svg]:fill-white">
              <KeyboardHelpList help={help} />
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsHelpVisible(!isHelpVisible)}
            data-test="toggle-help-footer"
            className="cursor-pointer rounded-md border border-white/15 px-2 py-1 text-xs tracking-widest uppercase duration-300 hover:border-white/30 hover:text-white">
            {isHelpVisible ? 'Hide keys' : 'Keyboard'} · Shift+H
          </button>
        </div>
      </div>
    </footer>
  );
}

const SectionLabel = twc.span`text-xs font-bold tracking-widest uppercase opacity-70`;

export default MenuFooter;
