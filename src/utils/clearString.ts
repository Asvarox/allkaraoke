import latinize from 'latinize';

const ALPHANUMERIC_REGEX = /[^0-9a-z]/gi;

export default function clearString(str: string) {
  return removeAccents(str).toLowerCase().normalize('NFKD').replace(ALPHANUMERIC_REGEX, '');
}
export function removeAccents(str: string) {
  return latinize(str);
}
