export const ADMIN_PASSWORD_STORAGE_KEY = 'shared-songs-admin-password';

export const getAdminPassword = () =>
  typeof sessionStorage === 'undefined' ? '' : (sessionStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) ?? '');

export const setAdminPassword = (password: string) => {
  sessionStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
};

export const clearAdminPassword = () => {
  sessionStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
};
