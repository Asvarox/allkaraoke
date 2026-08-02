import { Icon } from '~/modules/elements/akui/icon';
import { MenuButton } from '~/modules/elements/menu';

export const Checkbox = ({
  checked = false,
  className,
  ...props
}: React.ComponentProps<typeof MenuButton> & { checked?: boolean }) => {
  return (
    // The box goes through the button's own `leftIcon` gutter rather than a hand-rolled span, so it
    // lands in exactly the same place (and at the same size) as any other button's left icon. The
    // label stays left-aligned, so labels line up down a list of checkboxes instead of each centring
    // itself; it also truncates to one line rather than wrapping, same as a button's.
    <MenuButton
      data-checked={checked}
      data-test="checkbox"
      size="small"
      labelAlign="left"
      leftIcon={
        checked ? (
          <Icon icon="ic:baseline-check-box" className="stroke-black/50" />
        ) : (
          <Icon icon="ic:baseline-check-box-outline-blank" className="stroke-black/50" />
        )
      }
      {...props}
      className={className}>
      {props.children}
    </MenuButton>
  );
};
