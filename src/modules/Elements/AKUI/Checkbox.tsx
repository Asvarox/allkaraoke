import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { MenuButton } from 'modules/Elements/Menu';
import { twMerge } from 'tailwind-merge';

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
      <span className="flex h-4 w-4 items-center justify-center rounded">
        {checked ? <CheckBox className="h-12! w-12!" /> : <CheckBoxOutlineBlank className="h-12! w-12!" />}
      </span>
      {props.children}
    </MenuButton>
  );
};
