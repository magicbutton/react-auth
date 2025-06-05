// Main exports
export { MagicButtonAuthProvider, useAuth } from './components/MagicButtonAuthProvider';

// Type exports
export type {
  AuthToken,
  MagicButtonAuthConfig,
  AuthContextValue,
  AuthOrigin,
} from './types';

// Component exports
export { DevAuthComponent } from './components/DevAuthComponent';
export { MsalAuthComponent } from './components/MsalAuthComponent';

// Utility exports
export {
  parseToken,
  validateToken,
  isTokenExpired,
  extractTokenFromUrl,
  removeTokenFromUrl,
  TokenError,
} from './utils/token';

export { STORAGE_KEYS } from './utils/storage';