import { Meta, StoryFn } from '@storybook/react';
import { Autocomplete } from 'Elements/Autocomplete';
import { ComponentProps, useState } from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Autocomplete',
  component: Autocomplete,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    focused: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: {
      table: {
        disable: true,
      },
    },
    options: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    label: 'Label',
    player2Score: 70,
  },
} as Meta<ComponentProps<typeof Autocomplete>>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: StoryFn<ComponentProps<typeof Autocomplete>> = (args) => {
  const [value, setValue] = useState(args.value ?? '');
  const options = [
    'A name',
    'Super long name that should overflow',
    'John',
    'Alice',
    'Paul',
    'Lucian',
    'Second try',
    'More',
    'Names',
    'So the',
    'Dropdown',
    'Also overflow',
  ];

  return (
    <div style={{ width: 500, fontSize: 30 }}>
      <Autocomplete {...args} options={options} value={value} onChange={setValue} />
    </div>
  );
};

export const AutocompleteStory = Template.bind({});
