export const ADMIN_PASSWORD_STORAGE_KEY = 'admin-panel-password';

const getRememberedPasswordStorage = () => (typeof localStorage === 'undefined' ? null : localStorage);
const getSessionPasswordStorage = () => (typeof sessionStorage === 'undefined' ? null : sessionStorage);

export const getAdminPassword = () =>
  getRememberedPasswordStorage()?.getItem(ADMIN_PASSWORD_STORAGE_KEY) ??
  getSessionPasswordStorage()?.getItem(ADMIN_PASSWORD_STORAGE_KEY) ??
  '';

export const setAdminPassword = (password: string, remember: boolean) => {
  clearAdminPassword();
  const storage = remember ? getRememberedPasswordStorage() : getSessionPasswordStorage();
  storage?.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
};

export const clearAdminPassword = () => {
  getRememberedPasswordStorage()?.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
  getSessionPasswordStorage()?.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
};
