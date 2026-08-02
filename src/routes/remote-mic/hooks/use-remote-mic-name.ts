import createPersistedState from 'use-persisted-state';

const usePersistedName = createPersistedState<string>('remote_mic_name');

const generateDummyName = () => `Player #${Math.floor(1000 + Math.random() * 9000)}`;

// Shared across every mount of every component that calls this hook in the same page load, so the
// wizard and the top bar never disagree on the placeholder name of a not-yet-named mic
let cachedDummyName: string | null = null;

export default function useRemoteMicName() {
  const [storedName, setStoredName] = usePersistedName('');
  if (cachedDummyName === null) cachedDummyName = generateDummyName();

  return {
    name: storedName || cachedDummyName,
    hasStoredName: storedName !== '',
    setName: setStoredName,
  };
}
