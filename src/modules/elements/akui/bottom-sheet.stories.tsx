import { Meta, StoryFn } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';

import { BottomSheet } from './bottom-sheet';
import { Button } from './button';

export default {
  title: 'AKUI/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    viewport: { defaultViewport: 'mobile1' },
  },
} as Meta<ComponentProps<typeof BottomSheet>>;

export const Basic: StoryFn<ComponentProps<typeof BottomSheet>> = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 p-4">
      <Button size="small" onClick={() => setOpen(true)}>
        Open sheet
      </Button>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-1 pb-2">
          {['Option A', 'Option B', 'Option C', 'Option D'].map((label) => (
            <Button key={label} size="small" className="w-full justify-start" onClick={() => setOpen(false)}>
              {label}
            </Button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export const WithTitle: StoryFn<ComponentProps<typeof BottomSheet>> = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('Option A');
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 p-4">
      <Button size="small" onClick={() => setOpen(true)}>
        {selected} ▾
      </Button>
      <BottomSheet title="Choose an option" open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-1 pb-2">
          {['Option A', 'Option B', 'Option C', 'Option D', 'Option E'].map((label) => (
            <Button
              key={label}
              size="small"
              focused={label === selected}
              className="w-full justify-start"
              onClick={() => {
                setSelected(label);
                setOpen(false);
              }}>
              {label}
            </Button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export const ManyItems: StoryFn<ComponentProps<typeof BottomSheet>> = () => {
  const [open, setOpen] = useState(false);
  const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 p-4">
      <Button size="small" onClick={() => setOpen(true)}>
        Open long list
      </Button>
      <BottomSheet title="Scroll to see more" open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-1 pb-2">
          {items.map((label) => (
            <Button key={label} size="small" className="w-full justify-start" onClick={() => setOpen(false)}>
              {label}
            </Button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};
