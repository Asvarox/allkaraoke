import { ComponentType } from 'react';
import styled from 'styled-components';
import { typography } from '../../Elements/cssMixins';
import { HelpEntry } from './Context';

interface Props {
    help: HelpEntry | undefined;
}

export default function KeyboardHelpView({ help }: Props) {
    const helps = Object.entries(help ?? {}).filter(([, value]) => value !== undefined);
    return (
        <>
            {helps.length && (
                <Container>
                    {helps.map(([type, label]) => {
                        const { view: Component, defaultLabel } = KeyhelpComponent[type as keyof HelpEntry];
                        return (
                            <Section key={type}>
                                <SectionKeys>
                                    <Component />
                                </SectionKeys>
                                <SectionHelp>{label ?? defaultLabel}</SectionHelp>
                            </Section>
                        );
                    })}
                </Container>
            )}
        </>
    );
}

const Horizontal = () => (
    <>
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
    </>
);
const Vertical = () => (
    <>
        <Kbd>↑</Kbd>
        <br />
        <Kbd>↓</Kbd>
    </>
);
const HorizontalVertical = () => (
    <>
        <Kbd>↑</Kbd>
        <br />
        <Kbd>←</Kbd>
        <Kbd>↓</Kbd>
        <Kbd>→</Kbd>
    </>
);
const Accept = () => (
    <>
        <Kbd>Enter ⏎</Kbd>
    </>
);
const Back = () => (
    <>
        <Kbd>Backspace ⌫</Kbd>
    </>
);

const KeyhelpComponent: Record<keyof HelpEntry, { view: ComponentType; defaultLabel: string }> = {
    'horizontal-vertical': { view: HorizontalVertical, defaultLabel: 'Navigate' },
    horizontal: { view: Horizontal, defaultLabel: 'Navigate' },
    vertical: { view: Vertical, defaultLabel: 'Navigate' },
    accept: { view: Accept, defaultLabel: 'Select' },
    back: { view: Back, defaultLabel: 'Go back' },
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
    flex: 1;
`;
const SectionHelp = styled.span`
    flex: 1;
    ${typography};
    font-size: 20px;
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
    width: 320px;
`;

const Kbd = styled.kbd`
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
`;
