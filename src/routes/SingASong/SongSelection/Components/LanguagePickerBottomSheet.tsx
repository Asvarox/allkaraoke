import { BottomSheet } from '~/modules/Elements/AKUI/BottomSheet';
import { Button } from '~/modules/Elements/AKUI/Button';
import { Flag } from '~/modules/Elements/Flag';
import { useLanguageList } from '~/modules/Songs/hooks/useLanguageList';
import useSongIndex from '~/modules/Songs/hooks/useSongIndex';
import isE2E from '~/modules/utils/isE2E';

const MIN_SONGS_COUNT = isE2E() ? 0 : 30;

interface LanguagePickerBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (language: string) => void;
  /** The currently active language, if any — used to highlight the active entry. */
  selectedLanguage: string | null;
}

export default function LanguagePickerBottomSheet({
  open,
  onClose,
  onSelect,
  selectedLanguage,
}: LanguagePickerBottomSheetProps) {
  const songIndex = useSongIndex();
  // useLanguageList returns languages sorted by song count (most popular first)
  const allLanguages = useLanguageList(songIndex.data);
  const filteredLanguages = allLanguages.filter((lang) => lang.count > MIN_SONGS_COUNT);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-1 pb-2">
        {filteredLanguages.map(({ name, count }) => (
          <Button
            key={name}
            size="small"
            focused={name === selectedLanguage}
            onClick={() => {
              onSelect(name);
              onClose();
            }}
            className="w-full scale-100! justify-between pr-0 pl-4"
            data-test={`language-picker-${name}`}>
            <span>
              {name} <small className="pl-2 text-xs">({count} songs)</small>
            </span>
            <Flag language={[name]} className="h-full w-20 object-cover" />
          </Button>
        ))}
      </div>
    </BottomSheet>
  );
}
