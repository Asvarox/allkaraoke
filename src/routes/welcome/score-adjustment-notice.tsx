import { Menu } from '~/modules/elements/akui/menu';
import Modal from '~/modules/elements/modal';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import { ScoreAdjustmentNoticeSetting } from '~/modules/songs/stats/merged-track-score-fix';
import { useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  /** Off while another dialog is up over the menu, so the two never stack. */
  enabled: boolean;
}

/** Shown once, after past duet scores were rescaled by `fixStoredMergedTrackScores`. */
function ScoreAdjustmentNotice({ enabled }: Props) {
  const [pending, setPending] = useSettingValue(ScoreAdjustmentNoticeSetting);
  const isOpen = enabled && pending;

  const dismiss = () => setPending(false);

  const { register } = useKeyboardNav({
    enabled: isOpen,
    exclusive: true,
    onBackspace: dismiss,
    title: 'Scores adjusted',
  });

  return (
    <Modal open={isOpen} onClose={dismiss} withPortal level="nested" fullScreenOnPhone={false}>
      {isOpen && (
        <Menu spacing="tight" modal data-test="score-adjustment-notice">
          <Menu.Header>Scores adjusted</Menu.Header>
          <Menu.HelpText>
            Due to a bug, scores for some duet songs were not calculated properly. It&apos;s fixed now, and your past
            scores for these songs have been adjusted, so some of them are likely lower than before.
          </Menu.HelpText>
          <Menu.ButtonGroup className="flex-col sm:flex-row sm:justify-end">
            <Menu.Button
              size="small"
              className="sm:w-auto sm:min-w-40"
              data-test="score-adjustment-dismiss"
              {...register('score-adjustment-dismiss', dismiss, undefined, true, {
                control: { type: 'button', label: 'Got it' },
              })}>
              Got it
            </Menu.Button>
          </Menu.ButtonGroup>
        </Menu>
      )}
    </Modal>
  );
}

export default ScoreAdjustmentNotice;
