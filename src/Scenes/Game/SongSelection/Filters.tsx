import styled from 'styled-components';
import useKeyboard from '../../../Hooks/useKeyboard';
import { AppliedFilters, FiltersData } from './Hooks/useSongList';
import { Switcher } from './Switcher';

interface Props {
    onSongFiltered: (filters: AppliedFilters) => void;
    filters: FiltersData;
    onBack: () => void;
}
export default function Filters({ filters, onSongFiltered, onBack }: Props) {
    const selectedLanguage = filters.language.current;

    const { register } = useKeyboard(true, onBack);

    const cycleLanguage = () => {
        const index = filters.language.available.indexOf(selectedLanguage);

        onSongFiltered({
            ...filters,
            language: filters.language.available[(index + 1) % filters.language.available.length],
        });
    };

    return (
        <Container>
            <Switcher {...register('language', cycleLanguage)} label="Language" value={selectedLanguage || 'All'} />
        </Container>
    );
}

const Container = styled.div`
    background: rgba(0, 0, 0, 0.7);
    padding: 20px;
    width: 100%;
    font-size: 30px;
    box-sizing: border-box;
`;
