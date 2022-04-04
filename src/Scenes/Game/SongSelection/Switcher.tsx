import { ReactNode } from 'react';
import styled from 'styled-components';
import { focusable } from '../../../Elements/cssMixins';
import styles from '../Singing/GameOverlay/Drawing/styles';
import { SongListEntryDetails } from './SongCard';

interface Props {
    focused: boolean;
    label: ReactNode;
    value: ReactNode;
    onClick?: () => void;
}

export const Switcher = ({ focused, label, value, onClick, ...restProps }: Props) => (
    <ConfigurationPosition focused={focused} onClick={onClick} {...restProps}>
        <span>{label}:</span> <ConfigValue>{value}</ConfigValue>
    </ConfigurationPosition>
);

const ConfigurationPosition = styled(SongListEntryDetails)<{ focused: boolean }>`
    cursor: pointer;
    padding: 0.25em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    ${focusable}
`;

const ConfigValue = styled.span`
    color: ${styles.colors.text.active};
    font-size: 1.1em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    padding-left: 10px;
`;
