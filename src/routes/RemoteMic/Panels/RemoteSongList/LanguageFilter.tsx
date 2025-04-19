import { Menu } from 'modules/Elements/AKUI/Menu';
import { Flag } from 'modules/Elements/Flag';
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
      <Modal onClose={handleClose} open={open}>
        {open && (
          <Menu data-test="languages-container" spacing="tight">
            {filteredLanguageList.map(({ name, count }) => {
              const isExcluded = excludedLanguages.length && excludedLanguages.includes(name);
              return (
                <Menu.Button
                  size="small"
                  key={name}
                  data-inactive={isExcluded}
                  data-active={!!excludedLanguages.length && !excludedLanguages.includes(name)}
                  onClick={() => excludeLanguage(name)}
                  data-test={name}
                  className={`justify-between! pl-4`}>
                  <span>
                    {name} <small className="pl-2 text-sm">({count} songs)</small>
                  </span>
                  <Flag language={[name]} className="h-full w-32 object-cover" />
                </Menu.Button>
              );
            })}
            <Menu.Divider />
            <Menu.Button size="small" onClick={handleClose} data-test="close-language-filter">
              Close
            </Menu.Button>
          </Menu>
        )}
      </Modal>
      {children({ open: () => setOpen(true) })}
    </>
  );
}
