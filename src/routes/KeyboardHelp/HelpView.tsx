import { ComponentType } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { twc, TwcComponentProps } from 'react-twc';
import Box from '~/modules/Elements/AKUI/Primitives/Box';
import Typography from '~/modules/Elements/AKUI/Primitives/Typography';
import { supportsEscAsBack } from '~/modules/hooks/useKeyboard';
import {
  KeyboardHelpVisibilitySetting,
  MobilePhoneModeSetting,
  useSettingValue,
} from '~/routes/Settings/SettingsState';
import { RegularHelpEntry } from './Context';

interface Props {
  help: RegularHelpEntry;
}

export default function KeyboardHelpView({ help }: Props) {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const [isVisible, setIsVisible] = useSettingValue(KeyboardHelpVisibilitySetting);

  useHotkeys('shift+h', () => setIsVisible(!isVisible), undefined, [isVisible]);

  const helps = Object.entries(help ?? {}).filter(([, value]) => value !== undefined);

  if (mobilePhoneMode) {
    return null;
  }

  return (
    <>
      <Container
        data-test="help-container"
        onClick={() => setIsVisible(!isVisible)}
        data-visible={!!helps.length && isVisible}>
        {isVisible && (
          <>
            <UseKeyboardIndicator className="UseKeyboardIndicator">
              Use indicated keys on your keyboard
            </UseKeyboardIndicator>
            {helps.map(([type, label]) => {
              const { view: Component, defaultLabel } = KeyhelpComponent[type as keyof RegularHelpEntry];
              return (
                <Section key={type}>
                  <SectionHelp>{label ?? defaultLabel}</SectionHelp>
                  <SectionKeys>
                    <Component />
                  </SectionKeys>
                </Section>
              );
            })}
            <Section>
              <SectionHelp>Show/hide this help</SectionHelp>
              <SectionKeys>{ShiftLetter('h')()}</SectionKeys>
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

const Section = twc.div`flex items-center gap-4`;

const SectionKeys = twc.div`flex-nowrap flex-2 text-white font-bold text-center [&_kbd]:m-1`;

const SectionHelp = twc(Typography)`flex-3 text-base text-right`;

const UseKeyboardIndicator = twc(
  Typography,
)`absolute inset-0 bg-black/75 flex items-center justify-center text-white text-md p-8 invisible opacity-0 duration-300 hover:opacity-100 hover:visible`;

const Container = twc(Box)((props: TwcComponentProps<'div'> & { 'data-visible': boolean }) => [
  `fixed top-[5rem] right-0 p-2 items-stretch gap-4 w-[34rem] cursor-pointer scale-75 z-1000 [view-transition-name:help-view] [&_svg]:fill-white hover:[&_.UseKeyboardIndicator]:opacity-100 hover:[&_.UseKeyboardIndicator]:visible`,
  props['data-visible'] ? 'flex mobile:hidden' : 'hidden',
]);

export const Kbd = twc.kbd((props: TwcComponentProps<'kbd'> & { disabled?: boolean }) => [
  `py-3 px-4 rounded-md border-t-gray-300 border-l-gray-300 border-solid border-[1.25px] border-gray-500 text-gray-700 leading-4 text-sm bg-gray-50 inline-block font-normal`,
  props.disabled ? 'opacity-25' : 'opacity-100',
]);
