import { ComponentProps, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { toggleMasterMute } from '~/modules/audio/master-volume';
import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import { Tooltip } from '~/modules/elements/tooltip';
import { MasterMutedSetting, MasterVolumeSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props {
  size?: ComponentProps<typeof Button>['size'];
}

function VolumeMixer({ size = 'small' }: Props) {
  const [volume, setVolume] = useSettingValue(MasterVolumeSetting);
  const [muted] = useSettingValue(MasterMutedSetting);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useHotkeys('shift+m', toggleMasterMute);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      // The focused slider is about to unmount - hand focus back so Tab continues from the toolbar
      containerRef.current?.querySelector('button')?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // A double click fires click, click, dblclick: the two clicks cancel out (open/close), the dblclick mutes
  const handleClick = () => setIsOpen((current) => !current);

  const icon =
    muted || volume === 0
      ? 'ic:baseline-volume-off'
      : volume < 0.5
        ? 'ic:baseline-volume-down'
        : 'ic:baseline-volume-up';

  return (
    <div ref={containerRef} className="relative" data-test="volume-mixer">
      <Tooltip title="Volume (double click or Shift+M to mute)" place="bottom-end" hidden={isOpen}>
        <Button
          size={size}
          type="button"
          aria-label="Volume"
          aria-expanded={isOpen}
          data-test="toggle-volume-mixer"
          className="touch-manipulation"
          data-muted={muted}
          onClick={handleClick}
          onDoubleClick={toggleMasterMute}
          leftIcon={<Icon icon={icon} />}
        />
      </Tooltip>
      {isOpen && (
        <div
          className="absolute top-full right-0 z-10 mt-2 flex w-48 cursor-default items-center gap-2 rounded-xl bg-black/75 px-3 py-3"
          data-test="volume-mixer-panel">
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : Math.round(volume * 100)}
            aria-label="Master volume"
            data-test="volume-slider"
            className="accent-active h-2 w-full cursor-pointer"
            onChange={(event) => {
              const next = Number(event.target.value) / 100;
              setVolume(next);
              if (muted && next > 0) MasterMutedSetting.set(false);
            }}
          />
          <span className="w-10 text-right text-sm tabular-nums">{muted ? 'Off' : `${Math.round(volume * 100)}%`}</span>
        </div>
      )}
    </div>
  );
}

export default VolumeMixer;
