import { parseToken, isTokenExpired, validateToken, extractTokenFromUrl, removeTokenFromUrl } from './token';

// Mock JWT for testing
const createMockJWT = (payload: Record<string, unknown>, expired = false): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = expired ? Math.floor(Date.now() / 1000) - 3600 : Math.floor(Date.now() / 1000) + 3600;
  
  const fullPayload = {
    sub: 'testuser',
    username: 'testuser',
    name: 'Test User',
    roles: ['user'],
    exp,
    iat: Math.floor(Date.now() / 1000),
    ...payload,
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  
  return `${encodedHeader}.${encodedPayload}.mock-signature`;
};

describe('Token Utils', () => {
  describe('parseToken', () => {
    it('should parse a valid JWT token', () => {
      const token = createMockJWT({});
      const result = parseToken(token);
      
      expect(result).toBeTruthy();
      expect(result?.username).toBe('testuser');
      expect(result?.displayName).toBe('Test User');
      expect(result?.roles).toEqual(['user']);
    });

    it('should handle invalid tokens', () => {
      const result = parseToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should handle malformed JWT', () => {
      const result = parseToken('header.invalid-payload.signature');
      expect(result).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const token = parseToken(createMockJWT({}));
      expect(token).toBeTruthy();
      expect(isTokenExpired(token!)).toBe(false);
    });

    it('should return true for expired token', () => {
      const token = parseToken(createMockJWT({}, true));
      expect(token).toBeTruthy();
      expect(isTokenExpired(token!)).toBe(true);
    });

    it('should return true for token without expiration', () => {
      const tokenString = createMockJWT({ exp: undefined });
      const token = parseToken(tokenString);
      expect(token).toBeTruthy();
      // Manually set exp to undefined
      token!.exp = 0;
      expect(isTokenExpired(token!)).toBe(true);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const token = createMockJWT({});
      const result = await validateToken(token);
      expect(result).toBe(true);
    });

    it('should reject expired token', async () => {
      const token = createMockJWT({}, true);
      const result = await validateToken(token);
      expect(result).toBe(false);
    });

    it('should reject invalid token', async () => {
      const result = await validateToken('invalid-token');
      expect(result).toBe(false);
    });
  });

  describe('URL token extraction', () => {
    beforeEach(() => {
      // Reset location mock
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000',
          search: '',
        },
        writable: true,
      });
    });

    it('should extract token from URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?magicauth=test-token&other=param',
        },
        writable: true,
      });

      const token = extractTokenFromUrl();
      expect(token).toBe('test-token');
    });

    it('should return null when no token in URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?other=param',
        },
        writable: true,
      });

      const token = extractTokenFromUrl();
      expect(token).toBeNull();
    });

    it('should remove token from URL', () => {
      const mockReplaceState = jest.fn();
      Object.defineProperty(window, 'history', {
        value: { replaceState: mockReplaceState },
      });

      removeTokenFromUrl();
      expect(mockReplaceState).toHaveBeenCalled();
    });
  });
});