const abstractStorage = (type: typeof sessionStorage | typeof localStorage) => ({
  setItem: <T>(key: string, value: T) => {
    type.setItem(key, JSON.stringify(value));
  },
  getItem: <T = any>(key: string): T | null => {
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

  removeItem: (key: string) => {
    type.removeItem(key);
  },

  clear: () => {
    type.clear();
  },
});

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};

  public setItem(key: string, value: string) {
    this.store[key] = value;
  }

  public getItem(key: string): string | null {
    const val = this.store[key];

    if (val === undefined) {
      return null;
    }

    return val;
  }

  public removeItem(key: string) {
    delete this.store[key];
  }
  public get length() {
    return Object.keys(this.store).length;
  }

  public key(index: number) {
    return Object.keys(this.store)[index];
  }

  public clear() {
    this.store = {};
  }
}

const local = abstractStorage(global?.localStorage ?? new MemoryStorage());

const storage = {
  ...local,
  local,
  session: abstractStorage(global?.sessionStorage ?? new MemoryStorage()),
  memory: abstractStorage(new MemoryStorage()),
};

export default storage;
