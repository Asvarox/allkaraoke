const ALPHANUMERIC_REGEX = /[^0-9a-z]/gi;

export default function clearString(str: string) {
    return str.toLowerCase().normalize('NFKD').replace(ALPHANUMERIC_REGEX, '');
}
