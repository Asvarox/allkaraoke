import { useEffect, useMemo } from 'react';
import CountUp from 'react-countup';

import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { ScrollableColumn } from '~/modules/elements/akui/scrollable-container';
import { Skeleton } from '~/modules/elements/akui/skeleton';
import { Flag } from '~/modules/elements/flag';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import Modal from '~/modules/elements/modal';
import { NavButton, NavCheckbox } from '~/modules/elements/nav-controls';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import { ExcludedLanguagesSetting, useSettingValue } from '~/routes/settings/settings-state';
import { twx } from '~/utils/twx';

import { getDefaultExcludedLanguages, useSelectableLanguages } from './default-excluded-languages';

interface Props {
  onClose: () => void;
  closeText: string;
  /**
   * `page` is the standalone screen (its own route, reached from Manage Songs). `modal` is the
   * first-run ask, which sits over the screen that triggered it — the main menu — so picking
   * languages reads as a step of "sing a song" rather than a screen the user got sent to.
   */
  variant?: 'page' | 'modal';
  /** Modal only: leaving without committing a selection (Backspace, backdrop). Defaults to `onClose`. */
  onCancel?: () => void;
  /** Opened from the song selection: drops the first-run hints (where to change it, the song count) */
  inSongSelection?: boolean;
  /** Adds an "Edit song list" button */
  onEditSongs?: () => void;
}

function ExcludeLanguagesView({ onClose, closeText, variant = 'page', onCancel, inSongSelection, onEditSongs }: Props) {
  const isModal = variant === 'modal';
  const dismiss = onCancel ?? onClose;
  const { register } = useKeyboardNav({
    onBackspace: dismiss,
    title: 'Select Song Languages',
    // As a modal it owns the keyboard: the menu underneath stays on screen and would otherwise keep
    // reacting to the arrows.
    exclusive: isModal,
  });

  const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const { availableLanguages, languageList, isLoading } = useSelectableLanguages();
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
    if (excludedLanguages === null) {
      const toExclude = getDefaultExcludedLanguages(languageList);

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

  const list = (
    <>
      {isLoading && new Array(6).fill(0).map((_, i) => <Skeleton className="h-25 w-full shrink-0" key={i} />)}
      {languageList.map(({ name, count }) => {
        const excluded = excludedLanguages?.includes(name) ?? false;
        return (
          <NavCheckbox
            size="regular"
            className="relative shrink-0 transition-all duration-300"
            // The button's own `inactive` state, rather than a second dimming rule here: an
            // excluded language is the same idea as any other switched-off option, and the
            // remote mic's language filter already renders it that way.
            inactive={excluded}
            checked={!excluded}
            key={name}
            data-excluded={excluded}
            name={`lang-${name}`}
            label={name}
            onClick={() => toggleLanguage(name)}
            flag={<Flag language={[name]} />}>
            <span>
              <LanguageName>{name}</LanguageName> ({count} songs)
            </span>
          </NavCheckbox>
        );
      })}
      {otherSongCount > 0 && (
        <Menu.HelpText className="text-right">
          …and <strong>{otherSongCount} songs</strong> in other languages
        </Menu.HelpText>
      )}
    </>
  );

  const footer = (
    <>
      {!inSongSelection && (
        <Menu.HelpText>
          You can always update the selection in <strong>Manage Songs</strong> menu
        </Menu.HelpText>
      )}
      <NextButtonContainer>
        <NavButton
          name="close-exclude-languages"
          remoteIcon="confirm"
          isDefault
          disabled={areAllLanguagesExcluded || isLoading}
          onClick={onClose}>
          {closeText}
        </NavButton>
        {onEditSongs && (
          <NavButton name="edit-songs" size="small" onClick={onEditSongs}>
            Edit song list
          </NavButton>
        )}
        {!inSongSelection && (
          <Menu.HelpText className="text-right">
            The list will contain{' '}
            <strong>
              <CountUp duration={1} preserveValue end={songCount + otherSongCount} />
            </strong>{' '}
            songs
          </Menu.HelpText>
        )}
        {areAllLanguagesExcluded && (
          <Menu.HelpText data-test="all-languages-excluded-warning">
            <strong>
              <Icon icon="ic:baseline-warning" />
            </strong>{' '}
            You excluded all the languages, pick at least one
          </Menu.HelpText>
        )}
      </NextButtonContainer>
    </>
  );

  if (isModal) {
    return (
      <Modal open withPortal onClose={dismiss}>
        {/* The dialog is capped at the viewport and only the list inside it scrolls, so the running
            song count and the confirm button stay in sight however many languages there are. */}
        <Menu
          modal
          className="max-h-[85dvh] justify-start"
          data-test="exclude-languages-modal"
          // `Menu` claims the shared `menu-container` view-transition name, which is meant for the
          // screen a route swaps out. As an overlay it is not that screen, and a second element
          // holding the name aborts the transition the confirm button starts.
          style={{ viewTransitionName: 'none' }}>
          <Menu.Header>Select Song Languages</Menu.Header>
          <KeyboardNavContext value={register}>
            <ScrollableColumn className="w-full flex-1" contentClassName="gap-4 pb-1">
              {list}
            </ScrollableColumn>
            {footer}
          </KeyboardNavContext>
        </Menu>
      </Modal>
    );
  }

  return (
    <MenuWithLogo>
      <Menu.Header>Select Song Languages</Menu.Header>
      <KeyboardNavContext value={register}>
        {list}
        {footer}
      </KeyboardNavContext>
    </MenuWithLogo>
  );
}

const NextButtonContainer = twx.div`flex flex-col gap-2.5`;

const LanguageName = twx.span`transition-[300ms]`;

export default ExcludeLanguagesView;
