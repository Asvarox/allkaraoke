import { Kbd } from 'modules/Elements/AKUI/Kbd';
import Box from 'modules/Elements/AKUI/Primitives/Box';
import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import { supportsEscAsBack } from 'modules/hooks/useKeyboard';
import { ComponentType } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { twc, TwcComponentProps } from 'react-twc';
import { KeyboardHelpVisibilitySetting, MobilePhoneModeSetting, useSettingValue } from 'routes/Settings/SettingsState';
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

const SectionKeys = twc.div`flex-2 flex-nowrap text-center font-bold text-white`;

const SectionHelp = twc(Typography)`text-md flex-3 text-right`;

const UseKeyboardIndicator = twc(
  Typography,
)`text-md invisible absolute inset-0 flex items-center justify-center bg-black/75 p-8 text-white opacity-0 duration-300 hover:visible hover:opacity-100`;

const Container = twc(Box)((props: TwcComponentProps<'div'> & { 'data-visible': boolean }) => [
  `fixed top-[5rem] right-0 z-1000 w-[28rem] scale-75 cursor-pointer items-stretch gap-4 p-2 [view-transition-name:help-view] hover:[&_.UseKeyboardIndicator]:visible hover:[&_.UseKeyboardIndicator]:opacity-100 [&_svg]:fill-white`,
  props['data-visible'] ? 'mobile:hidden flex' : 'hidden',
]);
