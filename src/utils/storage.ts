export const STORAGE_KEYS = {
  DEV_TOKEN: 'magicbutton_dev_token',
  MSAL_TOKEN: 'magicbutton_msal_token',
  AUTH_ORIGIN: 'magicbutton_auth_origin',
} as const;

export const sessionStorage = {
  get: (key: string): string | null => {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: string): void => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to save to session storage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from session storage:', error);
    }
  },
};

export const localStorage = {
  get: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from local storage:', error);
    }
  },
};