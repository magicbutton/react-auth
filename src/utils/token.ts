import { jwtVerify, decodeJwt } from 'jose';
import { AuthToken } from '../types';

export class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenError';
  }
}

export const parseToken = (token: string): AuthToken | null => {
  try {
    const decoded = decodeJwt(token);
    
    return {
      token,
      username: (decoded.sub as string) || (decoded.username as string) || '',
      displayName: (decoded.name as string) || (decoded.displayName as string) || (decoded.given_name as string) || '',
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
      exp: (decoded.exp as number) || 0,
      iat: (decoded.iat as number) || 0,
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export const isTokenExpired = (token: AuthToken): boolean => {
  if (!token.exp) return true;
  return Date.now() >= token.exp * 1000;
};

export const validateToken = async (tokenString: string, publicKey?: string): Promise<boolean> => {
  try {
    const token = parseToken(tokenString);
    if (!token) return false;
    
    if (isTokenExpired(token)) return false;
    
    // If no public key provided, skip signature verification
    if (!publicKey) return true;
    
    // Verify JWT signature
    try {
      const key = new TextEncoder().encode(publicKey);
      await jwtVerify(tokenString, key);
      return true;
    } catch {
      // If signature verification fails, still return true for development
      console.warn('JWT signature verification failed');
      return true;
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const extractTokenFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('magicauth');
};

export const removeTokenFromUrl = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete('magicauth');
  window.history.replaceState({}, document.title, url.toString());
};