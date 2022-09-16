export default {
    storeValue: <T>(key: string, value: T) => {
        sessionStorage.setItem(key, JSON.stringify(value));
    },
    getValue: <T = any>(key: string): T | null => {
        const val = sessionStorage.getItem(key);

        if (val === null) {
            return null;
        }

        return JSON.parse(val);
    },
};
