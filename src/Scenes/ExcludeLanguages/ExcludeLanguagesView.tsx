import { MenuButton } from 'Elements/Menu';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { ExcludedLanguagesSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import useSongIndex from 'Songs/hooks/useSongIndex';
import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import languageNameToIsoCode from 'utils/languageNameToIsoCode';
import { SongPreview } from 'interfaces';
import { useEffect, useMemo } from 'react';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { css } from '@emotion/react';
import isE2E from 'utils/isE2E';
import MenuWithLogo from 'Elements/MenuWithLogo';
import CountUp from 'react-countup';

export const useLanguageList = (list: SongPreview[]) => {
    return useMemo(() => {
        const langs: Record<string, { name: string; count: number }> = {};

        list.forEach((song) => {
            if (!song.language) return;

            const langId = song.language?.toLowerCase();
            if (!langs[langId]) {
                langs[langId] = { name: song.language!, count: 0 };
            }
            langs[langId].count = langs[langId].count + 1;
        });

        return Object.values(langs);
    }, [list]);
};

interface Props {
    onClose: () => void;
    closeText: string;
}

const MIN_SONGS_COUNT = isE2E() ? 0 : 3;

function ExcludeLanguagesView({ onClose, closeText }: Props) {
    const { register } = useKeyboardNav({ onBackspace: onClose });

    const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
    const { data } = useSongIndex();
    const availableLanguages = useLanguageList(data);
    const languageList = useMemo(
        () =>
            availableLanguages
                .filter(({ name, count }) => languageNameToIsoCode(name) && count >= MIN_SONGS_COUNT)
                .sort((a, b) => b.count - a.count),
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
            let languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
            const preferredLanguages = navigator?.languages
                .map((lang) => languageNames.of(lang)?.toLowerCase()!)
                .filter(Boolean);

            const toExclude = languageList
                .map((lang) => lang.name)
                .filter((lang) => !preferredLanguages.some((preferred) => preferred.includes(lang.toLowerCase())))
                .filter((lang) => lang !== 'English'); // Always have English selected as default

            if (toExclude.length) {
                setExcludedLanguages(toExclude);
            }
        }
    }, [excludedLanguages, languageList]);

    return (
        <MenuWithLogo>
            <h1>Select Song Languages</h1>
            <LanguageListContainer>
                {languageList.map(({ name, count }) => {
                    const excluded = excludedLanguages?.includes(name) ?? false;
                    return (
                        <LanguageEntry
                            key={name}
                            excluded={excluded}
                            {...register(`lang-${name}`, () => toggleLanguage(name))}
                            data-test={`lang-${name}`}>
                            <Check>{excluded ? <CheckBoxOutlineBlank /> : <CheckBox />}</Check>
                            <span>
                                <LanguageName>{name}</LanguageName> ({count} songs)
                            </span>
                            <LanguageFlagBackground excluded={excluded}>
                                <img
                                    src={`https://flagcdn.com/${languageNameToIsoCode(name)}.svg`}
                                    alt={languageNameToIsoCode(name)}
                                />
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
                <MenuButton {...register('go back', onClose, undefined, true)} data-test="close-exclude-languages">
                    {closeText}
                </MenuButton>
                <Disclaimer>
                    The list will contain{' '}
                    <strong>
                        <CountUp duration={1} preserveValue end={songCount + otherSongCount} />
                    </strong>{' '}
                    songs
                </Disclaimer>
            </NextButtonContainer>
        </MenuWithLogo>
    );
}

const NextButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const Disclaimer = styled.h4`
    text-align: right;
`;

const Check = styled.div`
    svg {
        width: 4rem;
        height: 4rem;
    }
`;

const LanguageListContainer = styled.div`
    margin-top: 2rem;
`;
const LanguageName = styled.span`
    transition: 300ms;
`;

const LanguageFlagBackground = styled.div<{ excluded: boolean }>`
    transition: 300ms;
    opacity: 0.95;
    ${(props) =>
        props.excluded
            ? css`
                  filter: grayscale(0.6);
                  opacity: 0.5;
              `
            : ''}

    position: absolute;
    bottom: 0;
    right: 0;
    img {
        width: 17rem;
        margin: 1.5rem 0 0 0.5rem;
    }
    overflow: hidden;
    width: 17rem;
    height: 10rem;
`;

const LanguageEntry = styled(MenuButton)<{ excluded: boolean; focused: boolean }>`
    ${(props) =>
        props.excluded
            ? css`
                  ${props.focused ? '' : 'background: rgba(0, 0, 0, 0.55)'};
                  ${LanguageName} {
                      text-decoration: line-through white;
                      opacity: 0.5;
                  }
              `
            : ''}
    ${typography};
    display: flex;
    align-items: center;
    gap: 2rem;
    font-size: 3rem;
    padding-left: 3rem;

    position: relative;

    width: 100%;
`;

export default ExcludeLanguagesView;
