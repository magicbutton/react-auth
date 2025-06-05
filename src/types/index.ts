export interface AuthToken {
  token: string;
  username: string;
  displayName: string;
  roles: string[];
  exp: number;
  iat: number;
}

export interface MagicButtonAuthConfig {
  development?: boolean;
  msalConfig?: {
    clientId: string;
    tenantId: string;
    redirectUri?: string;
  };
  onAuthStateChange?: (isAuthenticated: boolean, token?: AuthToken) => void;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  username: string | null;
  displayName: string | null;
  roles: string[];
  authOrigin: 'query' | 'session' | 'msal' | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  error: string | null;
}

export type AuthOrigin = 'query' | 'session' | 'msal' | null;