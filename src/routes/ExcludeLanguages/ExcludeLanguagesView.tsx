import styled from '@emotion/styled';
import { CheckBox, CheckBoxOutlineBlank, Warning } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
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
      <h1>Select Song Languages</h1>
      <LanguageListContainer>
        {isLoading &&
          new Array(6).fill(0).map((_, i) => (
            <Skeleton variant="rectangular" width="100%" height="10rem" key={i}>
              <LanguageEntry data-excluded focused={false}>
                <Flag language={['English']} />
              </LanguageEntry>
            </Skeleton>
          ))}
        {languageList.map(({ name, count }) => {
          const excluded = excludedLanguages?.includes(name) ?? false;
          return (
            <LanguageEntry
              key={name}
              data-excluded={excluded}
              {...register(`lang-${name}`, () => toggleLanguage(name))}>
              <Check>{excluded ? <CheckBoxOutlineBlank /> : <CheckBox />}</Check>
              <span>
                <LanguageName>{name}</LanguageName> ({count} songs)
              </span>
              <LanguageFlagBackground data-excluded={excluded}>
                <Flag language={[name]} />
              </LanguageFlagBackground>
            </LanguageEntry>
          );
        })}
        {otherSongCount > 0 && (
          <Disclaimer>
            …and <strong>{otherSongCount} songs</strong> in other languages
          </Disclaimer>
        )}
      </LanguageListContainer>
      <h3>
        You can always update the selection in <strong>Manage Songs</strong> menu
      </h3>
      <NextButtonContainer>
        <MenuButton
          {...register('close-exclude-languages', onClose, undefined, true, {
            disabled: areAllLanguagesExcluded || isLoading,
          })}>
          {closeText}
        </MenuButton>
        <Disclaimer>
          The list will contain{' '}
          <strong>
            <CountUp duration={1} preserveValue end={songCount + otherSongCount} />
          </strong>{' '}
          songs
        </Disclaimer>
        {areAllLanguagesExcluded && (
          <Disclaimer data-test="all-languages-excluded-warning">
            <strong>
              <Warning />
            </strong>{' '}
            You excluded all the languages, pick at least one
          </Disclaimer>
        )}
      </NextButtonContainer>
    </MenuWithLogo>
  );
}

const NextButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Disclaimer = styled.h4`
  text-align: right;
`;

const Check = styled.div`
  svg {
    width: 3rem;
    height: 3rem;
  }
`;

const LanguageListContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const LanguageName = styled.span`
  transition: 300ms;
`;

const LanguageFlagBackground = styled.div`
  transition: 300ms;
  opacity: 0.95;
  &[data-excluded='true'] {
    filter: grayscale(0.6);
    opacity: 0.5;
  }

  position: absolute;
  bottom: 0;
  right: 0;
  img {
    width: 14rem;
    height: 8rem;
    object-fit: cover;
  }
  overflow: hidden;
  width: 14rem;
  height: 8rem;
`;

const LanguageEntry = styled(MenuButton)`
  &[data-excluded='true'] {
    text-decoration: line-through white;
    opacity: 0.5;
    &[data-focused='false'] {
      background: rgba(0, 0, 0, 0.55);
    }
  }
  justify-content: flex-start;
  gap: 2rem;
  font-size: 2.5rem;
  padding-left: 3rem;
  margin: 0;
  height: 8rem;

  position: relative;

  width: 100%;
`;

export default ExcludeLanguagesView;
