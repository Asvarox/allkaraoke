const abstractStorage = (type: typeof sessionStorage | typeof localStorage) => ({
  storeValue: <T>(key: string, value: T) => {
    type.setItem(key, JSON.stringify(value));
  },
  getValue: <T = any>(key: string): T | null => {
    const val = type.getItem(key);

    if (val === null) {
      return null;
    }

    try {
      return JSON.parse(val);
    } catch (e) {
      return val as T;
    }
  },
});

class MemoryStorage {
  private store: Record<string, any> = {};

  public storeValue<T>(key: string, value: T) {
    this.store[key] = value;
  }

  public getValue<T = any>(key: string): T | null {
    const val = this.store[key];

    if (val === undefined) {
      return null;
    }

    return val;
  }
}

const local = abstractStorage(localStorage);

const storage = {
  ...local,
  local,
  session: abstractStorage(sessionStorage),
  memory: new MemoryStorage(),
};

export default storage;
