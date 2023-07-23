const abstractStorage = (type: typeof sessionStorage | typeof localStorage) => ({
    storeValue: <T>(key: string, value: T) => {
        type.setItem(key, JSON.stringify(value));
    },
    getValue: <T = any>(key: string): T | null => {
        const val = type.getItem(key);

        if (val === null) {
            return null;
        }

        return JSON.parse(val);
    },
});

const storage = {
    ...abstractStorage(localStorage),
    session: abstractStorage(sessionStorage),
};

export default storage;
