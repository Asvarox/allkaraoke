import { ReactNode } from 'react';
import styled from 'styled-components';
import { focusable } from '../../../Elements/cssMixins';
import styles from '../Singing/Drawing/styles';
import { SongListEntryDetails } from './SongCard';

interface Props {
    focused: boolean;
    label: ReactNode;
    value: ReactNode;
    onClick: () => void;
}

export const Switcher = ({ focused, label, value, onClick, ...restProps }: Props) => (
    <ConfigurationPosition focused={focused} onClick={onClick} {...restProps}>
        {label}: <ConfigValue>{value}</ConfigValue>
    </ConfigurationPosition>
);

const ConfigurationPosition = styled(SongListEntryDetails)<{ focused: boolean }>`
    cursor: pointer;

    ${focusable}
`;

const ConfigValue = styled.span`
    color: ${styles.colors.text.active};
`;
