import { ComponentType } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { twc, TwcComponentProps } from 'react-twc';

import { Kbd } from '~/modules/elements/akui/kbd';
import Box from '~/modules/elements/akui/primitives/box';
import Typography from '~/modules/elements/akui/primitives/typography';
import { supportsEscAsBack } from '~/modules/hooks/use-keyboard';
import {
  KeyboardHelpVisibilitySetting,
  MobilePhoneModeSetting,
  useSettingValue,
} from '~/routes/settings/settings-state';

import { RegularHelpEntry } from './context';

interface Props {
  help: RegularHelpEntry;
}

export default function KeyboardHelpView({ help }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const [isVisible, setIsVisible] = useSettingValue(KeyboardHelpVisibilitySetting);

  useHotkeys('shift+h', () => setIsVisible(!isVisible), undefined, [isVisible]);

  // Only keys this view actually has a renderer for. `HelpEntry` also carries remote-mic-only
  // metadata (title, icon, mirrored controls) which the provider strips out — but this view sits at
  // the app root, so an unrecognised key reaching the lookup below would throw and take the whole UI
  // down with it. Skipping unknown keys keeps that failure mode impossible.
  const helps = Object.entries(help ?? {}).filter(([type, value]) => value !== undefined && type in KeyhelpComponent);
  const hasHelp = Object.values(help ?? {}).some((value) => value !== undefined);

  if (mobilePhoneMode) {
    return null;
  }

  return (
    <>
      <Container
        data-test="help-container"
        onClick={() => setIsVisible(!isVisible)}
        data-visible={hasHelp && isVisible}>
        {isVisible && (
          <>
            <UseKeyboardIndicator className="UseKeyboardIndicator">
              Use indicated keys on your keyboard
            </UseKeyboardIndicator>
            {helps.map(([type, label]) => {
              const { view: Component, defaultLabel } = KeyhelpComponent[type as keyof RegularHelpEntry];
              return (
                <Section key={type}>
                  <SectionKeys>
                    <Component />
                  </SectionKeys>
                  <SectionHelp>{label ?? defaultLabel}</SectionHelp>
                </Section>
              );
            })}
            <Section>
              <SectionKeys>{ShiftLetter('h')()}</SectionKeys>
              <SectionHelp>Show/hide this help</SectionHelp>
            </Section>
          </>
        )}
      </Container>
    </>
  );
}

const HorizontalVerticalBase = ({ vertical = false, horizontal = false }) => (
  <>
    <Kbd disabled={!vertical}>↑</Kbd>
    <br />
    <Kbd disabled={!horizontal}>←</Kbd>
    <Kbd disabled={!vertical}>↓</Kbd>
    <Kbd disabled={!horizontal}>→</Kbd>
  </>
);

const Horizontal = () => <HorizontalVerticalBase horizontal />;
const Vertical = () => <HorizontalVerticalBase vertical />;
const HorizontalVertical = () => <HorizontalVerticalBase vertical horizontal />;
const Accept = () => <Kbd>Enter ⏎</Kbd>;
const Back = () => (supportsEscAsBack ? <Kbd>Escape</Kbd> : <Kbd>Backspace ⌫</Kbd>);
const ShiftLetter = (letter: string) => () => (
  <>
    <Kbd>Shift</Kbd> + <Kbd>{letter.toUpperCase()}</Kbd>
  </>
);
const Alphanumeric = () => (
  <>
    <Kbd>start typing</Kbd>
  </>
);

const KeyhelpComponent: Record<keyof RegularHelpEntry, { view: ComponentType; defaultLabel: string }> = {
  'horizontal-vertical': { view: HorizontalVertical, defaultLabel: 'Navigate' },
  horizontal: { view: Horizontal, defaultLabel: 'Navigate' },
  vertical: { view: Vertical, defaultLabel: 'Navigate' },
  accept: { view: Accept, defaultLabel: 'Select' },
  back: { view: Back, defaultLabel: 'Go back' },
  shiftR: { view: ShiftLetter('r'), defaultLabel: 'Pick random' },
  alphanumeric: { view: Alphanumeric, defaultLabel: 'Search' },
};

// One entry per column - its keys on top, what they do underneath - so the panel reads as a strip of
// keys rather than a list of sentences, and stays short enough to sit in a corner. `justify-end`
// puts every column's keys against its label, so the labels line up however tall the keys above them
// are (the arrow pad is two rows, every other entry is one).
const Section = twc.div`flex min-w-0 flex-col items-center justify-end gap-1 text-center`;

// `text-sm` here rather than on the `Kbd`s themselves: they size in `em`, so the whole cluster -
// glyphs, padding and border - scales from this one place.
const SectionKeys = twc.div`flex-nowrap text-center text-sm font-bold text-white`;

const SectionHelp = twc(Typography)`text-center text-sm text-balance`;

const UseKeyboardIndicator = twc(
  Typography,
)`text-md invisible absolute inset-0 flex items-center justify-center bg-black/75 py-8 text-white opacity-0 duration-300 hover:visible hover:opacity-100`;

const Container = twc(Box)((props: TwcComponentProps<'div'> & { 'data-visible': boolean }) => [
  // Bottom right, laid out as a row: a panel of its own in the corner, rather than a column of text
  // down the side of whatever screen is up. Flush into the corner - no offset, and only the one
  // corner facing the page is rounded. `w-auto` so it is only as wide as its entries, and `items-end`
  // so every column sits on a shared bottom edge whatever the height of the keys above it.
  `fixed right-0 bottom-0 z-1000 w-auto max-w-screen cursor-pointer flex-row! items-end justify-end gap-4 rounded-none rounded-tl-xl px-2 py-2 [view-transition-name:help-view] hover:[&_.UseKeyboardIndicator]:visible hover:[&_.UseKeyboardIndicator]:opacity-100 [&_svg]:fill-white`,
  props['data-visible'] ? 'mobile:hidden flex' : 'hidden',
]);
