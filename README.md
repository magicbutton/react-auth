# @magicbutton/auth

A comprehensive React authentication package that provides JWT token authentication with support for query parameter tokens, MSAL (Microsoft Authentication Library) integration, and development mode testing.

[![npm version](https://badge.fury.io/js/%40magicbutton%2Fauth.svg)](https://badge.fury.io/js/%40magicbutton%2Fauth)
[![CI/CD](https://github.com/magicbutton/auth/actions/workflows/ci.yml/badge.svg)](https://github.com/magicbutton/auth/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/magicbutton/auth/branch/main/graph/badge.svg)](https://codecov.io/gh/magicbutton/auth)

## Features

- 🔐 **JWT Token Authentication** - Secure token parsing and validation
- 🔗 **Query Parameter Auth** - Automatic token extraction from URL parameters
- 👨‍💻 **Development Mode** - Easy testing with manual token input
- 🏢 **MSAL Integration** - Microsoft Azure AD authentication
- ⚡ **React Context** - Clean, modern React patterns
- 🪝 **TypeScript Hooks** - Fully typed authentication hooks
- 💾 **Storage Management** - Session and local storage integration
- 🧪 **Well Tested** - Comprehensive test coverage
- 📦 **Zero Config** - Works out of the box

## Installation

```bash
npm install @magicbutton/auth
```

### Peer Dependencies

```bash
npm install react react-dom
```

## Quick Start

### Basic Setup

```tsx
import React from 'react';
import { MagicButtonAuthProvider, useAuth } from '@magicbutton/auth';

// Your app component
const App: React.FC = () => {
  const auth = useAuth();
  
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {auth.displayName}!</h1>
      <p>Username: {auth.username}</p>
      <p>Roles: {auth.roles.join(', ')}</p>
      <button onClick={auth.signOut}>Sign Out</button>
    </div>
  );
};

// Root component with provider
const Root: React.FC = () => (
  <MagicButtonAuthProvider 
    config={{ 
      development: process.env.NODE_ENV === 'development' 
    }}
  >
    <App />
  </MagicButtonAuthProvider>
);

export default Root;
```

## Configuration

### Development Mode

For development and testing, enable development mode:

```tsx
<MagicButtonAuthProvider 
  config={{ 
    development: true 
  }}
>
  <App />
</MagicButtonAuthProvider>
```

In development mode, users can manually enter JWT tokens for testing.

### Production with MSAL

For production with Microsoft Azure AD:

```tsx
<MagicButtonAuthProvider 
  config={{
    development: false,
    msalConfig: {
      clientId: 'your-azure-client-id',
      authority: 'https://login.microsoftonline.com/your-tenant-id',
      redirectUri: 'https://your-app.com'
    },
    onAuthStateChange: (isAuthenticated, token) => {
      console.log('Auth state changed:', isAuthenticated, token);
    }
  }}
>
  <App />
</MagicButtonAuthProvider>
```

## Authentication Methods

### 1. Query Parameter Authentication

Automatically detects and processes the `magicauth` query parameter:

```
https://your-app.com?magicauth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token is automatically:
- Extracted from the URL
- Validated and parsed
- Stored in the context
- Removed from the URL for security

### 2. Session Storage (Development)

In development mode, tokens are stored in `sessionStorage` for persistence across page reloads.

### 3. MSAL Authentication

For production environments, users can sign in with Microsoft accounts through Azure AD.

## API Reference

### MagicButtonAuthProvider Props

```tsx
interface MagicButtonAuthConfig {
  development?: boolean;
  msalConfig?: {
    clientId: string;
    authority?: string;
    redirectUri?: string;
  };
  onAuthStateChange?: (isAuthenticated: boolean, token?: AuthToken) => void;
}
```

### useAuth Hook

```tsx
interface AuthContextValue {
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
```

### Token Structure

```tsx
interface AuthToken {
  token: string;
  username: string;
  displayName: string;
  roles: string[];
  exp: number;
  iat: number;
}
```

## Usage Examples

### Conditional Rendering Based on Authentication

```tsx
const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading, username, roles } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please sign in to access the dashboard.</div>;
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {username}!</p>
      {roles.includes('admin') && (
        <AdminPanel />
      )}
    </div>
  );
};
```

### Role-Based Access Control

```tsx
const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { roles } = useAuth();
  
  if (!roles.includes('admin')) {
    return <div>Access denied. Admin role required.</div>;
  }
  
  return <>{children}</>;
};
```

### Auth State Monitoring

```tsx
<MagicButtonAuthProvider 
  config={{
    onAuthStateChange: (isAuthenticated, token) => {
      if (isAuthenticated && token) {
        // Track authentication success
        analytics.track('user_authenticated', {
          username: token.username,
          roles: token.roles
        });
      } else {
        // Track sign out
        analytics.track('user_signed_out');
      }
    }
  }}
>
  <App />
</MagicButtonAuthProvider>
```

## Utility Functions

### Token Validation

```tsx
import { validateToken, parseToken, isTokenExpired } from '@magicbutton/auth';

const checkToken = async (tokenString: string) => {
  const isValid = await validateToken(tokenString);
  if (!isValid) return null;
  
  const token = parseToken(tokenString);
  if (!token || isTokenExpired(token)) return null;
  
  return token;
};
```

### URL Token Extraction

```tsx
import { extractTokenFromUrl, removeTokenFromUrl } from '@magicbutton/auth';

// Get token from URL
const token = extractTokenFromUrl();

// Remove token from URL for security
removeTokenFromUrl();
```

## Testing

The package includes comprehensive test utilities:

```tsx
import { render, screen } from '@testing-library/react';
import { MagicButtonAuthProvider } from '@magicbutton/auth';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MagicButtonAuthProvider config={{ development: true }}>
    {children}
  </MagicButtonAuthProvider>
);

test('authenticated user can access dashboard', () => {
  render(<Dashboard />, { wrapper: TestWrapper });
  // Test implementation
});
```

## Security Considerations

1. **Token Validation**: Always validate tokens before trusting them
2. **HTTPS Only**: Use HTTPS in production to protect tokens in transit
3. **Token Expiration**: Check token expiration before using
4. **Storage Security**: Session storage is cleared when the browser is closed
5. **URL Cleanup**: Query parameters are automatically removed after processing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## License

MIT © [MagicButton](https://github.com/magicbutton)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

## Support

- 📖 [Documentation](https://github.com/magicbutton/auth#readme)
- 🐛 [Issues](https://github.com/magicbutton/auth/issues)
- 💬 [Discussions](https://github.com/magicbutton/auth/discussions)

---

Made with ❤️ by the MagicButton team