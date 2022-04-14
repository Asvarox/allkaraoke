import { ComponentType } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from 'styled-components';
import createPersistedState from 'use-persisted-state';
import { typography } from '../../Elements/cssMixins';
import { HelpEntry } from './Context';

interface Props {
    help: HelpEntry | undefined;
}

const useIsVisible = createPersistedState('keyboard-help-visibility');

export default function KeyboardHelpView({ help }: Props) {
    const [isVisible, setIsVisible] = useIsVisible(true);

    useHotkeys('h', () => setIsVisible(!isVisible), undefined, [isVisible]);

    const helps = Object.entries(help ?? {}).filter(([, value]) => value !== undefined);
    return (
        <>
            {isVisible && !!helps.length && (
                <Container>
                    {helps.map(([type, label]) => {
                        const { view: Component, defaultLabel } = KeyhelpComponent[type as keyof HelpEntry];
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
                        <SectionKeys>
                            <Kbd>H</Kbd>
                        </SectionKeys>
                    </Section>
                </Container>
            )}
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
const Back = () => <Kbd>Backspace ⌫</Kbd>;
const Letter = (letter: string) => () => <Kbd>{letter.toUpperCase()}</Kbd>;

const KeyhelpComponent: Record<keyof HelpEntry, { view: ComponentType; defaultLabel: string }> = {
    'horizontal-vertical': { view: HorizontalVertical, defaultLabel: 'Navigate' },
    horizontal: { view: Horizontal, defaultLabel: 'Navigate' },
    vertical: { view: Vertical, defaultLabel: 'Navigate' },
    accept: { view: Accept, defaultLabel: 'Select' },
    back: { view: Back, defaultLabel: 'Go back' },
    letterF: { view: Letter('f'), defaultLabel: 'Letter' },
};

const Section = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

const SectionKeys = styled.div`
    flex-wrap: nowrap;
    text-align: center;
    flex: 2;
`;
const SectionHelp = styled.span`
    flex: 3;
    ${typography};
    font-size: 20px;
    text-align: right;
`;

const Container = styled.div`
    position: fixed;
    top: 15px;
    right: 15px;
    padding: 5px;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 340px;

    z-index: 100000;
`;

const Kbd = styled.kbd<{ disabled?: boolean }>`
    margin: 0.1em;
    padding: 0.05em 0.5em;
    border-radius: 3px;
    border: 1px solid rgb(204, 204, 204);
    color: rgb(51, 51, 51);
    line-height: 1.4;
    font-size: 16px;
    display: inline-block;
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.2), inset 0px 0px 0px 2px #ffffff;
    background-color: rgb(247, 247, 247);
    text-shadow: 0 1px 0 #fff;

    opacity: ${(props) => (props.disabled ? 0.25 : 1)};
`;
