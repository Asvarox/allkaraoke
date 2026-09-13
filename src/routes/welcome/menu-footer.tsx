import { Icon, IconName } from '~/modules/elements/akui/icon';
import { twx } from '~/utils/twx';

const socials: Array<{ name: string; icon: IconName; href: string }> = [
  { name: 'Facebook', icon: 'cib:facebook', href: 'https://www.facebook.com/allkaraoke.party' },
  { name: 'Instagram', icon: 'cib:instagram', href: 'https://www.instagram.com/allkaraoke.party' },
  { name: 'Github', icon: 'cib:github', href: 'https://github.com/Asvarox/allkaraoke' },
];

/**
 * The strip under the menu grid: contact links and the background music's attribution. Nothing here
 * is keyboard-navigable — they're read-only credits and mouse-only links, and putting them in the
 * arrow order would make the tiles harder to reach on a TV.
 *
 * Everything stays on the right: the bottom-left corner belongs to the floating keyboard help
 * (`help-view.tsx`), which would otherwise land on top of it.
 */
function MenuFooter() {
  return (
    <footer className="typography text-default/55 flex flex-wrap items-end justify-between gap-10 border-t border-white/10 pt-3 max-lg:gap-4">
      {/* Same attribution the menu has always carried, kept as its own view-transition target so it
          doesn't slide across the screen on the way in and out of the menu. */}
      <div className="flex flex-col gap-1 text-xs [view-transition-name:background-music-credit]">
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
    </footer>
  );
}

const SectionLabel = twx.span`text-xs font-bold tracking-widest uppercase`;

export default MenuFooter;
