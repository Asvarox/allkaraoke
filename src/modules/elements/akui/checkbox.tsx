import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { twMerge } from 'tailwind-merge';

import { MenuButton } from '~/modules/elements/menu';

export const Checkbox = ({
  checked = false,
  className,
  ...props
}: React.ComponentProps<typeof MenuButton> & { checked?: boolean }) => {
  return (
    <MenuButton
      data-checked={checked}
      data-test="checkbox"
      size="small"
      {...props}
      className={twMerge('justify-start gap-8 pl-8', className)}>
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded">
        {checked ? (
          <CheckBox className="h-8! w-8! stroke-black/50" />
        ) : (
          <CheckBoxOutlineBlank className="h-8! w-8! stroke-black/50" />
        )}
      </span>
      {/* Clip a long label to one line instead of wrapping it, matching how buttons behave. `min-w-0`
          is what gives `truncate` a bounded width to ellipsize against — without it the span grows to
          fit its text and wraps instead. Only bites where there isn't room (i.e. the remote mic); on
          the roomier in-game menus the labels still show in full. */}
      <span className="min-w-0 flex-1 truncate text-left">{props.children}</span>
    </MenuButton>
  );
};
