export const micColorToNumberMap = {
  blue: '0',
  red: '1',
  green: '2',
  yellow: '3',
} as const;

//alternative: export type micColorType = 'blue' | 'red' | 'green' | 'yellow';
export type micColorType = keyof typeof micColorToNumberMap;

export type columnNameType =
  | 'ID'
  | 'Artist'
  | 'Title'
  | 'Year'
  | 'Language'
  | 'Video'
  | 'Last Update'
  | 'Local'
  | 'Deleted'
  | 'Actions';
