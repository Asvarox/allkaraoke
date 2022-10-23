import isE2E from 'utils/isE2E';

export default function isDev() {
    return process.env.NODE_ENV === 'development' && !isE2E();
}
