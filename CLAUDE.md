# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Build the package
npm run build

# Build and watch for changes
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Full pre-publish check
npm run prepublishOnly
```

## Architecture Overview

This is a React authentication package (`@magicbutton/auth`) that provides JWT token authentication with multiple auth methods:

### Core Components

- **MagicButtonAuthProvider**: Main provider component that wraps the app and provides auth context
- **DevAuthComponent**: Development mode UI for manual token input
- **MsalAuthComponent**: Production UI for Microsoft Azure AD authentication
- **useAuth**: Hook for consuming auth state throughout the app

### Authentication Flow

The provider checks for authentication in this priority order:
1. Query parameter token (`?magicauth=jwt_token`) - automatically extracted and processed
2. Session storage token (development mode only) - persists across page reloads
3. MSAL authentication (production mode) - Microsoft Azure AD integration

### Key Files

- `src/components/MagicButtonAuthProvider.tsx` - Main auth provider with context and state management
- `src/utils/token.ts` - JWT token parsing, validation, and URL extraction utilities
- `src/utils/storage.ts` - Storage abstraction for session/local storage
- `src/utils/msal.ts` - Microsoft MSAL integration helpers
- `src/types/index.ts` - TypeScript type definitions
- `src/hooks/useAuth.ts` - Auth hook (re-exported from provider)

### Build System

- **Rollup** for bundling (CommonJS + ESM outputs)
- **TypeScript** for type checking and compilation
- **Jest** with jsdom for testing React components
- **ESLint** for code linting

### Package Configuration

- Peer dependencies: React 16.8+ (hooks required)
- Main dependencies: `@azure/msal-browser` for Azure AD, `jose` for JWT handling
- Exports both CommonJS and ESM formats with TypeScript declarations
- Coverage thresholds set at 70% for all metrics

### Development vs Production Modes

- **Development**: Shows manual token input UI, stores tokens in sessionStorage
- **Production**: Uses MSAL for Azure AD authentication, no manual token input

The package is designed to be zero-config for basic usage while supporting advanced configuration for production deployments.

## NPM Publishing

### Automated Publishing Setup

This repository has automated npm publishing configured with GitHub Actions:

- **NPM Access Token**: An "Automation" token has been placed in GitHub Secrets as `NPM_TOKEN`
- **2FA Bypass**: The automation token bypasses 2FA requirements for publishing
- **Automatic Publishing**: GitHub Actions automatically publishes to npm when version changes are detected on the main branch
- **Manual Publishing**: Available via the "Release" workflow in GitHub Actions

### Publishing Process

1. **Version Updates**: Use `npm version patch|minor|major` to bump version
2. **Automatic**: Push to main branch triggers automatic publishing if version changed
3. **Manual**: Use GitHub Actions "Release" workflow for manual version bumping and publishing

### Important Notes

- No OTP/2FA codes required for publishing via GitHub Actions
- The automation token handles authentication automatically
- Manual publishing from local machine would still require OTP (not recommended)
- Always use GitHub Actions for publishing to ensure consistency
- **Package Manager**: Workflows are configured to use `pnpm` (not npm) for dependency management
- **Lockfile**: Uses `pnpm-lock.yaml` for dependency locking