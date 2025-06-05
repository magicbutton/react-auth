import '@testing-library/jest-dom';

// Mock jose library
jest.mock('jose', () => ({
  decodeJwt: jest.fn((token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      throw new Error('Invalid token');
    }
  }),
  jwtVerify: jest.fn(() => Promise.resolve({ payload: {} })),
}));

// Mock window.sessionStorage and localStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
});

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
});

// Mock URL constructor
Object.defineProperty(window, 'URL', {
  value: class MockURL {
    searchParams: URLSearchParams;
    
    constructor(url: string) {
      this.searchParams = new URLSearchParams(url.split('?')[1] || '');
    }
    
    toString() {
      return 'http://localhost:3000';
    }
  },
});

// Mock history API
Object.defineProperty(window, 'history', {
  value: {
    replaceState: jest.fn(),
  },
});

// Mock location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    search: '',
  },
  writable: true,
});