import { Warning } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import { Checkbox } from 'modules/Elements/AKUI/Checkbox';
import { Menu } from 'modules/Elements/AKUI/Menu';
import { Flag } from 'modules/Elements/Flag';
import { MenuButton } from 'modules/Elements/Menu';
import MenuWithLogo from 'modules/Elements/MenuWithLogo';
import { useLanguageList } from 'modules/Songs/hooks/useLanguageList';
import useSongIndex from 'modules/Songs/hooks/useSongIndex';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import isE2E from 'modules/utils/isE2E';
import languageNameToIsoCode from 'modules/utils/languageNameToIsoCode';
import { useEffect, useMemo } from 'react';
import CountUp from 'react-countup';
import { twc } from 'react-twc';
import { ExcludedLanguagesSetting, useSettingValue } from 'routes/Settings/SettingsState';

interface Props {
  onClose: () => void;
  closeText: string;
}

const MIN_SONGS_COUNT = isE2E() ? 0 : 20;

function ExcludeLanguagesView({ onClose, closeText }: Props) {
  const { register } = useKeyboardNav({ onBackspace: onClose });

  const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const { data, isLoading } = useSongIndex();
  const availableLanguages = useLanguageList(data);
  const languageList = useMemo(
    () => availableLanguages.filter(({ name, count }) => languageNameToIsoCode(name) && count >= MIN_SONGS_COUNT),
    [availableLanguages],
  );
  const otherSongCount = useMemo(
    () =>
      availableLanguages
        .filter(({ name }) => !languageList.find((lang) => lang.name === name))
        .reduce((acc, { count }) => acc + count, 0),
    [availableLanguages, languageList],
  );

  const songCount = languageList
    .filter(({ name }) => !excludedLanguages?.includes(name))
    .reduce((acc, { count }) => acc + count, 0);

  const toggleLanguage = (language: string) => {
    if (excludedLanguages === null) setExcludedLanguages([language]);
    else if (!excludedLanguages.includes(language)) setExcludedLanguages([...excludedLanguages, language]);
    else setExcludedLanguages(excludedLanguages.filter((lang) => lang !== language));
  };

  useEffect(() => {
    if (excludedLanguages === null && navigator?.languages) {
      const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
      const preferredLanguages = navigator?.languages
        .map((lang) => languageNames.of(lang)?.toLowerCase())
        .filter(Boolean) as string[];

      const toExclude = languageList
        .map((lang) => lang.name)
        .filter((lang) => !preferredLanguages.some((preferred) => preferred.includes(lang.toLowerCase())))
        .filter((lang) => lang !== 'English'); // Always have English selected as default

      if (toExclude.length) {
        setExcludedLanguages(toExclude);
      }
    }
  }, [excludedLanguages, languageList]);

  const areAllLanguagesExcluded = useMemo(
    () => languageList.every((language) => excludedLanguages?.includes(language.name)),
    [excludedLanguages, languageList],
  );

  // If the language list changes (e.g. MIN_SONGS_COUNT is increased), remove any excluded languages that are no longer available
  useEffect(() => {
    if (excludedLanguages?.find((language) => !languageList.find((lang) => lang.name === language))) {
      setExcludedLanguages(excludedLanguages.filter((language) => languageList.find((lang) => lang.name === language)));
    }
  }, [languageList, excludedLanguages, setExcludedLanguages]);

  return (
    <MenuWithLogo>
      <Menu.Header>Select Song Languages</Menu.Header>
      <>
        {isLoading &&
          new Array(6).fill(0).map((_, i) => (
            <Skeleton variant="rectangular" width="100%" height="100px" key={i}>
              <LanguageEntry data-excluded focused={false}>
                <Flag language={['English']} />
              </LanguageEntry>
            </Skeleton>
          ))}
        {languageList.map(({ name, count }) => {
          const excluded = excludedLanguages?.includes(name) ?? false;
          return (
            <Checkbox
              size="regular"
              className={`relative transition-all ${excluded ? 'opacity-50' : 'opacity-100'} duration-300`}
              checked={!excluded}
              key={name}
              data-excluded={excluded}
              {...register(`lang-${name}`, () => toggleLanguage(name))}>
              <span>
                <LanguageName>{name}</LanguageName> ({count} songs)
              </span>
              <div
                className={`absolute top-0 right-0 bottom-0 w-20 transition-all md:w-30 ${excluded ? 'grayscale-75' : 'grayscale-0'}`}>
                <Flag language={[name]} className="h-full w-full object-cover" />
              </div>
            </Checkbox>
          );
        })}
        {otherSongCount > 0 && (
          <Menu.HelpText className="text-right">
            …and <strong>{otherSongCount} songs</strong> in other languages
          </Menu.HelpText>
        )}
      </>
      <Menu.HelpText>
        You can always update the selection in <strong>Manage Songs</strong> menu
      </Menu.HelpText>
      <NextButtonContainer>
        <MenuButton
          {...register('close-exclude-languages', onClose, undefined, true, {
            disabled: areAllLanguagesExcluded || isLoading,
          })}>
          {closeText}
        </MenuButton>
        <Menu.HelpText className="text-right">
          The list will contain{' '}
          <strong>
            <CountUp duration={1} preserveValue end={songCount + otherSongCount} />
          </strong>{' '}
          songs
        </Menu.HelpText>
        {areAllLanguagesExcluded && (
          <Menu.HelpText data-test="all-languages-excluded-warning">
            <strong>
              <Warning />
            </strong>{' '}
            You excluded all the languages, pick at least one
          </Menu.HelpText>
        )}
      </NextButtonContainer>
    </MenuWithLogo>
  );
}

const NextButtonContainer = twc.div`
  flex flex-col gap-2.5
`;

const LanguageName = twc.span`
  transition-[300ms]
`;

const LanguageEntry = twc(MenuButton)`
  data-[excluded=true]:line-through data-[excluded=true]:decoration-white data-[excluded=true]:opacity-50
  data-[excluded=true]:data-[focused=false]:bg-black/55
  justify-start m-0 relative w-full
`;

export default ExcludeLanguagesView;
