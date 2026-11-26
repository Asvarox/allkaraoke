export const ADMIN_PASSWORD_STORAGE_KEY = 'admin-panel-password';

const getRememberedPasswordStorage = () => (typeof localStorage === 'undefined' ? null : localStorage);
const getSessionPasswordStorage = () => (typeof sessionStorage === 'undefined' ? null : sessionStorage);

export const getAdminPassword = () =>
  getRememberedPasswordStorage()?.getItem(ADMIN_PASSWORD_STORAGE_KEY) ??
  getSessionPasswordStorage()?.getItem(ADMIN_PASSWORD_STORAGE_KEY) ??
  '';

/** Admin-only tools (e.g. editing instrumental versions) are shown once an admin password is stored */
export const isAdminUser = () => !!getAdminPassword();

export const setAdminPassword = (password: string, remember: boolean) => {
  clearAdminPassword();
  const storage = remember ? getRememberedPasswordStorage() : getSessionPasswordStorage();
  storage?.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
};

export const clearAdminPassword = () => {
  getRememberedPasswordStorage()?.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
  getSessionPasswordStorage()?.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
};
