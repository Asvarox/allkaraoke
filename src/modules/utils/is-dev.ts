import isE2E from '~/modules/utils/is-e2-e';

export default function isDev() {
  return process.env.NODE_ENV === 'development' && !isE2E();
}
