import styled from '@emotion/styled';
import { Casino, Search } from '@mui/icons-material';
import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '~/modules/Elements/Button';
import { Tooltip } from '~/modules/Elements/Tooltip';
import styles from '~/modules/GameEngine/Drawing/styles';
import QuickSearch from '~/routes/SingASong/SongSelection/Components/QuickSearch';

import { AppliedFilters } from '~/routes/SingASong/SongSelection/Hooks/useSongListFilter';

interface Props {
  onRandom: () => void;
  setFilters: Dispatch<SetStateAction<AppliedFilters>>;
  filters: AppliedFilters;
  keyboardControl: boolean;
}

export default function AdditionalListControls({ onRandom, setFilters, filters, keyboardControl }: Props) {
  const [searchActive, setSearchActive] = useState(false);

  const clearSearch = () => {
    setFilters((current) => ({ ...current, search: '' }));
  };

  return (
    <>
      <Container>
        <Tooltip title="Search" place="left">
          <RoundButton
            onClick={() => (searchActive ? clearSearch() : setSearchActive(true))}
            data-test="search-song-button">
            <Search />
          </RoundButton>
        </Tooltip>
        <Tooltip title="Pick random" place="left">
          <RoundButton onClick={onRandom} data-test="random-song-button">
            <Casino />
          </RoundButton>
        </Tooltip>
      </Container>

      <QuickSearch
        setFilters={setFilters}
        filters={filters}
        visible={searchActive}
        setVisible={setSearchActive}
        keyboardControl={keyboardControl}
      />
    </>
  );
}

const RoundButton = styled(Button)`
  box-shadow: inset 0 0 2px 2px ${styles.colors.text.active};
  background: black;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 3rem;
    height: 3rem;
  }
`;

const Container = styled.div`
  pointer-events: none;
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  //bottom: 50%;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 100;
  gap: 1.5rem;
`;
