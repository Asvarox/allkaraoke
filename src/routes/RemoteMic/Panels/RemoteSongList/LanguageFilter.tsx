import { Flag } from 'modules/Elements/Flag';
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

  const handleClose = () => setOpen(false);

  const filteredLanguageList = languageList.filter((lang) => lang.count > MIN_SONGS_COUNT);

  console.log(excludedLanguages);
  const excludeLanguage = (name: string) => {
    const visibleExcludedLanguages = excludedLanguages.filter((lang) =>
      filteredLanguageList.find((l) => l.name === lang),
    );
    if (visibleExcludedLanguages.length === 0) {
      onListChange(languageList.filter((lang) => lang.name !== name).map((lang) => lang.name));
    } else if (visibleExcludedLanguages.includes(name)) {
      onListChange(excludedLanguages.filter((lang) => lang !== name));
    } else if (visibleExcludedLanguages.length === filteredLanguageList.length - 1) {
      onListChange([]);
    } else {
      onListChange([...excludedLanguages, name]);
    }
  };

  return (
    <>
      {open && (
        <Modal onClose={handleClose}>
          <MenuContainer data-test="languages-container" className="!gap-1">
            {filteredLanguageList.map(({ name, count }) => {
              const isExcluded = excludedLanguages.length && excludedLanguages.includes(name);
              return (
                <MenuButton
                  size={'small'}
                  key={name}
                  data-active={!!excludedLanguages.length && !excludedLanguages.includes(name)}
                  onClick={() => excludeLanguage(name)}
                  data-test={name}
                  className={`flex !justify-between ${isExcluded && `line-through decoration-white opacity-25`}`}>
                  <span className={isExcluded ? 'line-through decoration-white' : ''}>
                    {name}
                    <small className="text-2xl pl-2">({count})</small>
                  </span>
                  <Flag language={[name]} className=" h-full w-32 object-cover" />
                </MenuButton>
              );
            })}
            <hr />
            <MenuButton size="small" onClick={handleClose} data-test="close-language-filter">
              Close
            </MenuButton>
          </MenuContainer>
        </Modal>
      )}
      {children({ open: () => setOpen(true) })}
    </>
  );
}
