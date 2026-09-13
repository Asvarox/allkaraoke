import { useEffect, useMemo } from 'react';
import CountUp from 'react-countup';

import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { Skeleton } from '~/modules/elements/akui/skeleton';
import { Flag } from '~/modules/elements/flag';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import { NavButton, NavCheckbox } from '~/modules/elements/nav-controls';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import { useLanguageList } from '~/modules/songs/hooks/use-language-list';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import isE2E from '~/modules/utils/is-e2-e';
import languageNameToIsoCode from '~/modules/utils/language-name-to-iso-code';
import { ExcludedLanguagesSetting, useSettingValue } from '~/routes/settings/settings-state';
import { twx } from '~/utils/twx';

interface Props {
  onClose: () => void;
  closeText: string;
}

const MIN_SONGS_COUNT = isE2E() ? 0 : 20;

function ExcludeLanguagesView({ onClose, closeText }: Props) {
  const { register } = useKeyboardNav({ onBackspace: onClose, title: 'Select Song Languages' });

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
  }, [excludedLanguages, languageList, setExcludedLanguages]);

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
      <KeyboardNavContext value={register}>
        <>
          {isLoading && new Array(6).fill(0).map((_, i) => <Skeleton className="h-25 w-full" key={i} />)}
          {languageList.map(({ name, count }) => {
            const excluded = excludedLanguages?.includes(name) ?? false;
            return (
              <NavCheckbox
                size="regular"
                className="relative transition-all duration-300"
                // The button's own `inactive` state, rather than a second dimming rule here: an
                // excluded language is the same idea as any other switched-off option, and the
                // remote mic's language filter already renders it that way.
                inactive={excluded}
                checked={!excluded}
                key={name}
                data-excluded={excluded}
                name={`lang-${name}`}
                label={name}
                onClick={() => toggleLanguage(name)}>
                <span>
                  <LanguageName>{name}</LanguageName> ({count} songs)
                </span>
                <div
                  className={`absolute top-[1px] right-[1px] bottom-[1px] w-18 transition-all md:w-28 ${excluded ? 'grayscale-75' : 'grayscale-0'}`}>
                  <Flag language={[name]} className="h-full w-full rounded-xl object-cover p-1.5" />
                </div>
              </NavCheckbox>
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
          <NavButton
            name="close-exclude-languages"
            remoteIcon="confirm"
            isDefault
            disabled={areAllLanguagesExcluded || isLoading}
            onClick={onClose}>
            {closeText}
          </NavButton>
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
                <Icon icon="ic:baseline-warning" />
              </strong>{' '}
              You excluded all the languages, pick at least one
            </Menu.HelpText>
          )}
        </NextButtonContainer>
      </KeyboardNavContext>
    </MenuWithLogo>
  );
}

const NextButtonContainer = twx.div`flex flex-col gap-2.5`;

const LanguageName = twx.span`transition-[300ms]`;

export default ExcludeLanguagesView;
