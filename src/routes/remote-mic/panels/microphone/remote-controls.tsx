import { useEffect, useState } from 'react';

import { Checkbox } from '~/modules/elements/akui/checkbox';
import { Icon } from '~/modules/elements/akui/icon';
import { Menu } from '~/modules/elements/akui/menu';
import { Input } from '~/modules/elements/input';
import { MenuButton, MenuContainer } from '~/modules/elements/menu';
import Modal from '~/modules/elements/modal';
import { Switcher } from '~/modules/elements/switcher';
import { serverRpc } from '~/modules/remote-mic/network/client';
import { assertNever, ControlDescriptor } from '~/routes/keyboard-help/controls';
import { remoteButtonIcons } from '~/routes/keyboard-help/remote-button-icons';
import NumericInput from '~/routes/remote-mic/components/numeric-input';
import { remoteSelectorBackground } from '~/routes/remote-mic/components/remote-control-styles';

interface Props {
  control: ControlDescriptor;
  onActivate: (name: string) => void;
}

/**
 * Renders a single mirrored control on the remote mic using the SAME components the host screen
 * renders with (`MenuButton`/`Switcher`/`Checkbox`) — so the remote looks, truncates, and animates
 * exactly like the in-game menu, with nothing to keep in sync by hand.
 *
 * The exhaustive `switch` (with `assertNever`) guarantees at build time that every control type the
 * host can emit has a remote renderer.
 *
 * There is no "focused" state here on purpose: remote mics are touch-first, so a highlighted
 * "current" control would be misleading — every control is tapped directly.
 */
export default function RemoteControl({ control, onActivate }: Props) {
  const activate = () => onActivate(control.name);

  switch (control.type) {
    case 'button': {
      const isBack = control.variant === 'back';
      // Back buttons keep a leading arrow and no trailing icon. Every other button gets a trailing
      // icon: `'forward'` by default, a named glyph when the host overrides it, or none when `null`.
      const rightIcon = isBack || control.icon === null ? undefined : remoteButtonIcons[control.icon ?? 'forward'];
      return (
        <MenuButton
          size="small"
          onClick={activate}
          disabled={control.disabled}
          leftIcon={isBack ? <Icon icon="ic:baseline-arrow-back" /> : undefined}
          rightIcon={rightIcon ? <Icon icon={rightIcon} /> : undefined}
          data-test={`control-${control.name}`}
          data-control-type="button">
          {control.label}
        </MenuButton>
      );
    }
    case 'switch':
      return (
        <Switcher
          label={control.label}
          value={control.value}
          onClick={activate}
          disabled={control.disabled}
          className={remoteSelectorBackground}
          data-test={`control-${control.name}`}
          data-control-type="switch"
        />
      );
    case 'checkbox':
      return (
        <Checkbox
          checked={control.checked}
          onClick={activate}
          disabled={control.disabled}
          className={remoteSelectorBackground}
          data-test={`control-${control.name}`}
          data-control-type="checkbox">
          {control.label}
        </Checkbox>
      );
    case 'text':
      return <TextControl control={control} />;
    case 'input-lag':
      return <InputLagControl control={control} />;
    default:
      return assertNever(control);
  }
}

/**
 * A mirrored free-form text field. The keyboard row itself is a plain button showing the current
 * value; tapping it opens a modal holding the actual input and an explicit "Apply".
 *
 * A modal rather than an inline field because the mirrored keyboard is a column of tap targets: an
 * always-live input would fight the on-screen keyboard for the little vertical room a phone has, and
 * leave "is this saved yet?" ambiguous. Nothing reaches the host until Apply, so a half-typed name is
 * never pushed to the TV — dismissing the modal discards the edit.
 */
function TextControl({ control }: { control: Extract<ControlDescriptor, { type: 'text' }> }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(control.value);

  const openEditor = () => {
    // Start from whatever the host currently holds, not a stale draft from a dismissed edit.
    setDraft(control.value);
    setOpen(true);
  };

  const apply = () => {
    void serverRpc.input.setControlValue(control.name, draft);
    setOpen(false);
  };

  return (
    <>
      <MenuButton
        size="small"
        onClick={openEditor}
        disabled={control.disabled}
        rightIcon={<Icon icon="ic:baseline-edit" />}
        data-test={`control-${control.name}`}
        data-control-type="text">
        {control.value || control.placeholder || control.label}
      </MenuButton>
      {/* Mounted only while open, rather than left mounted with `open={false}`: `Modal` wraps its
          backdrop and panel in a Fragment inside `AnimatePresence`, which can't track a multi-child
          fragment — the exit animation runs to completion but the nodes are never removed, leaving a
          full-screen `pointer-events: auto` overlay at opacity 0 that would swallow every tap on the
          phone. Unmounting the whole modal drops those nodes with it; the cost is the 300ms exit
          fade, which is no loss for a small utility dialog. */}
      {open && (
        <Modal open onClose={() => setOpen(false)} withPortal>
          <MenuContainer className="gap-2.5">
            <Menu.Header>{control.label}</Menu.Header>
            <Input
              focused={false}
              label=""
              autoFocus
              placeholder={control.placeholder}
              value={draft}
              onChange={setDraft}
              // Enter is "done" on a phone keyboard, so treat it as Apply rather than making the user
              // dismiss the keyboard to reach the button.
              onKeyDown={(e) => {
                if (e.key === 'Enter') apply();
              }}
              data-test="control-value-input"
            />
            <MenuButton onClick={apply} focused data-test="control-value-apply">
              Apply
            </MenuButton>
          </MenuContainer>
        </Modal>
      )}
    </>
  );
}

/**
 * The game's global input-lag stepper, mirrored to the phone. Wired straight to
 * `serverRpc.settings.setInputLag` — the same RPC the remote settings screen uses — so it behaves
 * identically wherever it appears. Local optimistic state keeps the stepper snappy while the host
 * round-trips a fresh descriptor value.
 */
function InputLagControl({ control }: { control: Extract<ControlDescriptor, { type: 'input-lag' }> }) {
  const [value, setValue] = useState(control.value);
  useEffect(() => setValue(control.value), [control.value]);

  const change = (newValue: number) => {
    setValue(newValue);
    void serverRpc.settings.setInputLag(newValue);
  };

  return (
    <div data-test={`control-${control.name}`} data-control-type="input-lag">
      {/* Unlike every other mirrored control the stepper shows no label of its own — just a number
          between two arrows — so it needs one underneath saying what it adjusts. */}
      <NumericInput
        value={value}
        onChange={change}
        disabled={control.disabled}
        unit="ms"
        info={`${control.label} — increase if the sound lags behind the lyrics`}
        data-test="game-input-lag"
      />
    </div>
  );
}
