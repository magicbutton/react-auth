import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MagicButtonAuthProvider, useAuth } from './MagicButtonAuthProvider';
import { MagicButtonAuthConfig } from '../types';

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="loading-status">
        {auth.isLoading ? 'loading' : 'not-loading'}
      </div>
      <div data-testid="username">{auth.username || 'no-username'}</div>
      <div data-testid="display-name">{auth.displayName || 'no-display-name'}</div>
      <div data-testid="roles">{auth.roles.join(',') || 'no-roles'}</div>
      <div data-testid="auth-origin">{auth.authOrigin || 'no-origin'}</div>
      {auth.error && <div data-testid="error">{auth.error}</div>}
      <button onClick={auth.signOut} data-testid="sign-out">Sign Out</button>
    </div>
  );
};

const createMockJWT = (payload: Record<string, unknown>): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = {
    sub: 'testuser',
    username: 'testuser',
    name: 'Test User',
    roles: ['user'],
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    ...payload,
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  
  return `${encodedHeader}.${encodedPayload}.mock-signature`;
};

describe('MagicButtonAuthProvider', () => {
  beforeEach(() => {
    // Clear all storage
    window.sessionStorage.clear();
    window.localStorage.clear();
    
    // Reset location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        search: '',
        origin: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  describe('Development Mode', () => {
    const devConfig: MagicButtonAuthConfig = {
      development: true,
    };

    it('should show development auth component when not authenticated', async () => {
      render(
        <MagicButtonAuthProvider config={devConfig}>
          <TestComponent />
        </MagicButtonAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Development Authentication')).toBeInTheDocument();
      });
    });

    it('should authenticate with valid token in development mode', async () => {
      const mockToken = createMockJWT({});
      
      render(
        <MagicButtonAuthProvider config={devConfig}>
          <TestComponent />
        </MagicButtonAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Development Authentication')).toBeInTheDocument();
      });

      const tokenInput = screen.getByLabelText('JWT Token');
      const submitButton = screen.getByText('Set Token');

      fireEvent.change(tokenInput, { target: { value: mockToken } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('username')).toHaveTextContent('testuser');
        expect(screen.getByTestId('display-name')).toHaveTextContent('Test User');
        expect(screen.getByTestId('auth-origin')).toHaveTextContent('session');
      });
    });

    it('should handle invalid token in development mode', async () => {
      render(
        <MagicButtonAuthProvider config={devConfig}>
          <TestComponent />
        </MagicButtonAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Development Authentication')).toBeInTheDocument();
      });

      const tokenInput = screen.getByLabelText('JWT Token');
      const submitButton = screen.getByText('Set Token');

      fireEvent.change(tokenInput, { target: { value: 'invalid-token' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
      });
    });
  });

  describe('Query Parameter Authentication', () => {
    it('should authenticate from query parameter', async () => {
      const mockToken = createMockJWT({});
      
      Object.defineProperty(window, 'location', {
        value: {
          href: `http://localhost:3000?magicauth=${mockToken}`,
          search: `?magicauth=${mockToken}`,
          origin: 'http://localhost:3000',
        },
        writable: true,
      });

      const config: MagicButtonAuthConfig = { development: false };

      render(
        <MagicButtonAuthProvider config={config}>
          <TestComponent />
        </MagicButtonAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('auth-origin')).toHaveTextContent('query');
      });
    });
  });

  describe('Session Storage Authentication', () => {
    it('should authenticate from session storage in development mode', async () => {
      const mockToken = createMockJWT({});
      window.sessionStorage.setItem('magicbutton_dev_token', mockToken);

      const config: MagicButtonAuthConfig = { development: true };

      render(
        <MagicButtonAuthProvider config={config}>
          <TestComponent />
        </MagicButtonAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('auth-origin')).toHaveTextContent('session');
      });
    });
  });

  describe('Sign Out', () => {
    it('should sign out user', async () => {
      const mockToken = createMockJWT({});
      window.sessionStorage.setItem('magicbutton_dev_token', mockToken);

      const config: MagicButtonAuthConfig = { development: true };

      render(
        <MagicButtonAuthProvider config={config}>
          <TestComponent />
        </MagicButtonAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      const signOutButton = screen.getByTestId('sign-out');
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(screen.getByText('Development Authentication')).toBeInTheDocument();
      });
    });
  });

  describe('Auth State Callback', () => {
    it('should call onAuthStateChange callback', async () => {
      const mockCallback = jest.fn();
      const mockToken = createMockJWT({});
      
      Object.defineProperty(window, 'location', {
        value: {
          href: `http://localhost:3000?magicauth=${mockToken}`,
          search: `?magicauth=${mockToken}`,
          origin: 'http://localhost:3000',
        },
        writable: true,
      });

      const config: MagicButtonAuthConfig = {
        development: false,
        onAuthStateChange: mockCallback,
      };

      render(
        <MagicButtonAuthProvider config={config}>
          <TestComponent />
        </MagicButtonAuthProvider>
      );

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(true, expect.objectContaining({
          username: 'testuser',
          displayName: 'Test User',
        }));
      });
    });
  });

  describe('Hook outside provider', () => {
    it('should throw error when useAuth is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within a MagicButtonAuthProvider');
      
      consoleSpy.mockRestore();
    });
  });
});