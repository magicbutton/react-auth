import { Configuration, PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { MagicButtonAuthConfig } from '../types';

export const createMsalConfig = (config: MagicButtonAuthConfig['msalConfig']): Configuration => {
  if (!config?.clientId) {
    throw new Error('MSAL clientId is required');
  }
  
  if (!config?.tenantId) {
    throw new Error('MSAL tenantId is required');
  }

  return {
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      // Automatically use current host as redirect URI if not specified
      redirectUri: config.redirectUri || window.location.origin,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  };
};

export const createMsalInstance = (config: MagicButtonAuthConfig['msalConfig']): PublicClientApplication => {
  const msalConfig = createMsalConfig(config);
  return new PublicClientApplication(msalConfig);
};

export const getAccountFromMsal = (msalInstance: PublicClientApplication): AccountInfo | null => {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
};

export const extractTokenFromMsalAccount = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _account: AccountInfo
): string | null => {
  // MSAL doesn't directly expose the raw JWT token
  // This would typically require an additional token request
  // For now, we'll return a placeholder - in real implementation,
  // you'd need to request a token for your API
  return null;
};