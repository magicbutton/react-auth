# NPM Publishing Setup Guide

This guide explains how to set up automatic npm publishing with GitHub Actions when you have 2FA enabled on your npm account.

## Prerequisites

- npm account with 2FA enabled
- Repository access to configure secrets
- Package published to npm registry (initial setup)

## Step 1: Create an npm Access Token

1. **Log in to npmjs.com**
   - Go to https://www.npmjs.com/
   - Sign in to your account

2. **Generate an Access Token**
   - Click on your profile picture → "Access Tokens"
   - Click "Generate New Token" → "Classic Token"
   - Select **"Automation"** type (this bypasses 2FA for CI/CD)
   - Copy the token (it starts with `npm_`)

## Step 2: Add the Token to GitHub Secrets

1. **Go to Repository Settings**
   - Navigate to your GitHub repository
   - Click "Settings" → "Secrets and variables" → "Actions"

2. **Add New Secret**
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

## Step 3: Verify Workflows

The repository includes two publishing workflows:

### Automatic Publishing (ci.yml)
- **Trigger**: Push to main branch
- **Condition**: Only publishes if package.json version differs from npm
- **Process**: Test → Build → Version Check → Publish → GitHub Release

### Manual Release (release.yml)
- **Trigger**: Manual workflow dispatch
- **Options**: patch, minor, or major version bump
- **Process**: Test → Build → Version Bump → Commit → Publish → GitHub Release

## Step 4: First Publish (Manual)

For the initial publish, you may need to publish manually:

```bash
# Build the package
npm run build

# Publish to npm (will prompt for 2FA)
npm publish --access public
```

## Step 5: Automated Publishing

### Option 1: Update Version and Push
```bash
# Update version in package.json
npm version patch  # or minor/major

# Push to trigger automatic publishing
git push origin main
git push --tags
```

### Option 2: Use Manual Release Workflow
1. Go to GitHub → Actions → "Release" workflow
2. Click "Run workflow"
3. Select version bump type (patch/minor/major)
4. Click "Run workflow"

## Important Notes

### Token Security
- **Never commit tokens to code**
- **Use "Automation" token type** (bypasses 2FA)
- **Rotate tokens regularly** (every 6-12 months)

### Version Management
- The workflows check if the version in `package.json` differs from the published version
- Only publishes when version changes are detected
- Automatic version bumping available via manual workflow

### Troubleshooting

**Publishing Fails with 2FA Error:**
- Ensure you're using an "Automation" token, not "Publish" token
- Verify the token is correctly added to GitHub secrets

**Version Already Published:**
- Check that `package.json` version is higher than the published version
- Use `npm view @magicbutton/auth version` to check current published version

**Token Expired:**
- Generate a new token on npmjs.com
- Update the `NPM_TOKEN` secret in GitHub

## Workflow Features

- ✅ **Automatic version detection** - Only publishes when version changes
- ✅ **2FA bypass** - Works with npm accounts that have 2FA enabled
- ✅ **Test before publish** - Runs full test suite before publishing
- ✅ **GitHub releases** - Automatically creates GitHub releases
- ✅ **Build verification** - Ensures package builds successfully
- ✅ **Multi-node testing** - Tests on Node.js 18.x and 20.x

## Manual Commands

```bash
# Check current published version
npm view @magicbutton/auth version

# Check package.json version
node -p "require('./package.json').version"

# Publish manually (for testing)
npm publish --access public --dry-run  # Test run
npm publish --access public            # Actual publish
```

## Package Information

- **Package Name**: `@magicbutton/auth`
- **Registry**: https://registry.npmjs.org
- **Access**: Public
- **Scope**: @magicbutton