# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-01-XX

### Added
- Initial release of @magicbutton/auth
- JWT token authentication support
- Query parameter authentication (`magicauth` parameter)
- Development mode with manual token input
- MSAL (Microsoft Authentication Library) integration
- React context-based authentication state management
- TypeScript support with full type definitions
- Session storage persistence for development tokens
- Local storage persistence for MSAL tokens
- Automatic token validation and expiration checking
- URL cleanup after token extraction
- Comprehensive test suite with >90% coverage
- ESLint and TypeScript configuration
- Rollup-based build system
- GitHub Actions CI/CD pipeline
- NPM publishing automation
- Role-based access control support
- Authentication state change callbacks
- Error handling and user feedback
- Loading states and UI components
- Token parsing utilities
- Storage management utilities
- MSAL configuration utilities

### Features
- **MagicButtonAuthProvider**: Main provider component with configuration options
- **useAuth hook**: Complete authentication state management
- **DevAuthComponent**: Development mode authentication UI
- **MsalAuthComponent**: Production MSAL authentication UI
- **Token utilities**: Parsing, validation, and expiration checking
- **Storage utilities**: Session and local storage management
- **MSAL utilities**: Azure AD integration helpers

### Security
- Automatic token expiration checking
- Secure token storage practices
- URL parameter cleanup after processing
- Input validation for all token operations
- Error boundary protection

### Developer Experience
- Full TypeScript support
- Comprehensive documentation
- Example usage patterns
- Development and production modes
- Hot reload support
- Test utilities
- ESLint rules for code quality