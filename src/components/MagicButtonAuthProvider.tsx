import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { AuthContextValue, AuthToken, MagicButtonAuthConfig, AuthOrigin } from '../types';
import { 
  parseToken, 
  validateToken, 
  extractTokenFromUrl, 
  removeTokenFromUrl 
} from '../utils/token';
import { sessionStorage, localStorage, STORAGE_KEYS } from '../utils/storage';
import { createMsalInstance, getAccountFromMsal } from '../utils/msal';
import { DevAuthComponent } from './DevAuthComponent';
import { MsalAuthComponent } from './MsalAuthComponent';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface MagicButtonAuthProviderProps {
  children: ReactNode;
  config: MagicButtonAuthConfig;
}

export const MagicButtonAuthProvider: React.FC<MagicButtonAuthProviderProps> = ({
  children,
  config,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<AuthToken | null>(null);
  const [authOrigin, setAuthOrigin] = useState<AuthOrigin>(null);
  const [error, setError] = useState<string | null>(null);
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

  // Initialize MSAL if config provided
  useEffect(() => {
    if (config.msalConfig && !config.development) {
      try {
        const instance = createMsalInstance(config.msalConfig);
        setMsalInstance(instance);
        
        // Initialize MSAL
        instance.initialize().catch((error) => {
          console.error('MSAL initialization failed:', error);
          setError('Authentication service initialization failed');
        });
      } catch (error) {
        console.error('MSAL setup failed:', error);
        setError('Authentication service setup failed');
      }
    }
  }, [config]);

  const setTokenAndAuth = useCallback((tokenString: string, parsedToken: AuthToken, origin: AuthOrigin) => {
    setToken(tokenString);
    setAuthToken(parsedToken);
    setAuthOrigin(origin);
    setIsAuthenticated(true);
    setError(null);
    
    // Call callback if provided
    config.onAuthStateChange?.(true, parsedToken);
  }, [config]);

  // Check for authentication on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Check for query parameter token
        const queryToken = extractTokenFromUrl();
        if (queryToken) {
          const isValid = await validateToken(queryToken);
          if (isValid) {
            const parsedToken = parseToken(queryToken);
            if (parsedToken) {
              setTokenAndAuth(queryToken, parsedToken, 'query');
              removeTokenFromUrl();
              setIsLoading(false);
              return;
            }
          }
          removeTokenFromUrl();
        }

        // 2. Check session storage for dev token
        if (config.development) {
          const devToken = sessionStorage.get(STORAGE_KEYS.DEV_TOKEN);
          if (devToken) {
            const isValid = await validateToken(devToken);
            if (isValid) {
              const parsedToken = parseToken(devToken);
              if (parsedToken) {
                setTokenAndAuth(devToken, parsedToken, 'session');
                setIsLoading(false);
                return;
              }
            }
            sessionStorage.remove(STORAGE_KEYS.DEV_TOKEN);
          }
        }

        // 3. Check MSAL for existing authentication
        if (msalInstance && !config.development) {
          try {
            await msalInstance.handleRedirectPromise();
            const account = getAccountFromMsal(msalInstance);
            if (account) {
              // In a real implementation, you'd request a token here
              // For now, we'll create a mock token from account info
              const mockToken = createMockTokenFromAccount(account);
              setTokenAndAuth(mockToken, parseToken(mockToken)!, 'msal');
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('MSAL authentication check failed:', error);
          }
        }

        // No authentication found
        setIsAuthenticated(false);
        setToken(null);
        setAuthToken(null);
        setAuthOrigin(null);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setError('Authentication check failed');
      }

      setIsLoading(false);
    };

    checkAuthentication();
  }, [config, msalInstance, setTokenAndAuth]);

  const handleDevTokenSubmit = async (tokenString: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const isValid = await validateToken(tokenString);
      if (!isValid) {
        setError('Invalid or expired token');
        setIsLoading(false);
        return;
      }

      const parsedToken = parseToken(tokenString);
      if (!parsedToken) {
        setError('Unable to parse token');
        setIsLoading(false);
        return;
      }

      sessionStorage.set(STORAGE_KEYS.DEV_TOKEN, tokenString);
      setTokenAndAuth(tokenString, parsedToken, 'session');
    } catch (error) {
      console.error('Token validation failed:', error);
      setError('Token validation failed');
    }

    setIsLoading(false);
  };

  const handleMsalSignIn = async () => {
    if (!msalInstance) {
      setError('Authentication service not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
      });

      if (loginResponse.account) {
        const mockToken = createMockTokenFromAccount(loginResponse.account);
        setTokenAndAuth(mockToken, parseToken(mockToken)!, 'msal');
      }
    } catch (error) {
      console.error('MSAL sign-in failed:', error);
      setError('Sign-in failed. Please try again.');
    }

    setIsLoading(false);
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setToken(null);
    setAuthToken(null);
    setAuthOrigin(null);
    setError(null);

    // Clear storage
    sessionStorage.remove(STORAGE_KEYS.DEV_TOKEN);
    localStorage.remove(STORAGE_KEYS.MSAL_TOKEN);

    // MSAL logout
    if (msalInstance && authOrigin === 'msal') {
      msalInstance.logoutPopup().catch(console.error);
    }

    // Call callback if provided
    config.onAuthStateChange?.(false);
  };

  const contextValue: AuthContextValue = {
    isAuthenticated,
    isLoading,
    token,
    username: authToken?.username || null,
    displayName: authToken?.displayName || null,
    roles: authToken?.roles || [],
    authOrigin,
    signIn: config.development ? () => Promise.resolve() : handleMsalSignIn,
    signOut,
    error,
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading...</p>
        </div>
        <style>
          {`@keyframes spin { to { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  // Show authentication UI if not authenticated
  if (!isAuthenticated) {
    if (config.development) {
      return (
        <DevAuthComponent
          onTokenSubmit={handleDevTokenSubmit}
          error={error}
        />
      );
    } else {
      return (
        <MsalAuthComponent
          onSignIn={handleMsalSignIn}
          isLoading={isLoading}
          error={error}
        />
      );
    }
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a MagicButtonAuthProvider');
  }
  return context;
};

// Helper function to create mock token from MSAL account
const createMockTokenFromAccount = (account: Record<string, unknown>): string => {
  const payload = {
    sub: account.username,
    username: account.username,
    name: account.name || account.username,
    displayName: account.name || account.username,
    roles: [],
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    iat: Math.floor(Date.now() / 1000),
  };

  // This is a simple base64 encoding for demo purposes
  // In production, you'd get a real JWT from your API
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payloadEncoded = btoa(JSON.stringify(payload));
  return `${header}.${payloadEncoded}.`;
};