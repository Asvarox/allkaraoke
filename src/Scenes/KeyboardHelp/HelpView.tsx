import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { KeyboardHelpVisibilitySetting, MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { supportsEscAsBack } from 'hooks/useKeyboard';
import { ComponentType } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
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
        visible={!!helps.length && isVisible}>
        {isVisible && (
          <>
            <UseKeyboardIndicator>Use indicated keys on your keyboard</UseKeyboardIndicator>
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

const Section = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
`;

const SectionKeys = styled.div`
  flex-wrap: nowrap;
  text-align: center;
  flex: 2;
  color: white;
  font-weight: bold;
`;
const SectionHelp = styled.span`
  flex: 3;
  ${typography};
  font-size: 2rem;
  text-align: right;
`;

const UseKeyboardIndicator = styled.div`
  position: absolute;
  inset: 0 0 0 0;
  background: rgba(0, 0, 0, 0.75);
  ${typography};
  font-size: 2rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  opacity: 0;
  transition: 300ms;
  visibility: hidden;
`;

const Container = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 5rem;
  right: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 34rem;
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  cursor: pointer;
  transform: scale(0.75);

  z-index: 1000;

  @media (max-width: 560px) {
    display: none;
  }

  view-transition-name: help-view;

  :hover {
    ${UseKeyboardIndicator} {
      opacity: 1;
      visibility: visible;
    }
  }

  svg {
    fill: white;
  }
`;

const Kbd = styled.kbd<{ disabled?: boolean }>`
  margin: 0.2rem;
  padding: 0.12rem 0.9rem;
  border-radius: 0.3rem;
  border: 0.1rem solid rgb(204, 204, 204);
  color: rgb(51, 51, 51);
  line-height: 1.4;
  font-size: 1.6rem;
  display: inline-block;
  box-shadow:
    0 0.1rem 0 rgba(0, 0, 0, 0.2),
    inset 0 0 0 0.2rem #ffffff;
  background-color: rgb(247, 247, 247);
  text-shadow: 0 0.1rem 0 #fff;
  font-weight: normal;

  opacity: ${(props) => (props.disabled ? 0.25 : 1)};
`;
