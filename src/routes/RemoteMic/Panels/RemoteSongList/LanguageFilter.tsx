import { MenuButton, MenuContainer } from 'modules/Elements/Menu';
import Modal from 'modules/Elements/Modal';
import isE2E from 'modules/utils/isE2E';
import { useState } from 'react';
import { useLanguageList } from 'routes/ExcludeLanguages/ExcludeLanguagesView';

interface Props {
  excludedLanguages: string[];
  languageList: ReturnType<typeof useLanguageList>;
  onListChange: (list: string[]) => void;
  children: (props: { open: () => void }) => React.ReactNode;
}

const MIN_SONGS_COUNT = isE2E() ? 0 : 30;

export default function LanguageFilter({ children, languageList, excludedLanguages, onListChange }: Props) {
  const [open, setOpen] = useState(false);

  const excludeLanguage = (name: string) => {
    if (excludedLanguages.length === 0) {
      onListChange(languageList.filter((lang) => lang.name !== name).map((lang) => lang.name));
    } else if (excludedLanguages.includes(name)) {
      onListChange(excludedLanguages.filter((lang) => lang !== name));
    } else if (excludedLanguages.length === languageList.length - 1) {
      onListChange([]);
    } else {
      onListChange([...excludedLanguages, name]);
    }
  };

  return (
    <>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <MenuContainer data-test="languages-container" className="!gap-1">
            {languageList
              .filter((lang) => lang.count > MIN_SONGS_COUNT)
              .map(({ name, count }) => (
                <MenuButton
                  size={'small'}
                  key={name}
                  data-active={!!excludedLanguages.length && !excludedLanguages.includes(name)}
                  onClick={() => excludeLanguage(name)}
                  data-test={name}>
                  <span className={excludedLanguages.length && !excludedLanguages.includes(name) ? 'text-active' : ''}>
                    {name}
                  </span>{' '}
                  <small className="text-2xl pl-2">({count})</small>
                </MenuButton>
              ))}
          </MenuContainer>
        </Modal>
      )}
      {children({ open: () => setOpen(true) })}
    </>
  );
}
