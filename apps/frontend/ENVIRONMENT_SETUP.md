# Environment Configuration Guide

This guide explains how to use the dynamic backend URL configuration based on different environments.

## Overview

The app now supports three environments:

- **Development**: For local development with your local backend
- **Staging**: For testing with a staging backend
- **Production**: For the live production backend

## Configuration Files

### Environment Configuration

- `config/environment.ts` - Main environment configuration logic
- `app.json` - Development configuration (default)
- `app.staging.json` - Staging configuration
- `app.production.json` - Production configuration
- `eas.json` - EAS build configuration for different environments

## How It Works

The app automatically detects the environment based on:

1. **Development Mode**: Uses `__DEV__` flag (when running `expo start`)
2. **Staging**: Uses `Constants.expoConfig?.extra?.environment === 'staging'`
3. **Production**: Default fallback for built apps

## Backend URLs

Update the URLs in `config/environment.ts`:

```typescript
const environments: Record<string, EnvironmentConfig> = {
  development: {
    API_URL: "http://192.168.1.90:3000/api/trpc", // Your local IP
    ENV: "development",
  },
  staging: {
    API_URL: "https://your-staging-api.com/api/trpc", // Replace with staging URL
    ENV: "staging",
  },
  production: {
    API_URL: "https://your-production-api.com/api/trpc", // Replace with production URL
    ENV: "production",
  },
};
```

## Usage

### Development

```bash
# Regular development (uses app.json)
npm run start
npm run android
npm run ios
npm run web
```

### Staging

```bash
# Start with staging config
npm run start:staging
npm run android:staging
npm run ios:staging
npm run web:staging

# Build for staging
npm run build:android:staging
npm run build:ios:staging
```

### Production

```bash
# Start with production config
npm run start:production
npm run android:production
npm run ios:production
npm run web:production

# Build for production
npm run build:android:production
npm run build:ios:production
```

## EAS Build Commands

```bash
# Development build
eas build --profile development

# Staging build
eas build --profile staging

# Production build
eas build --profile production
```

## Environment Detection

The app will log the current environment configuration when it starts. Check your console for:

```
🌍 Environment Info: {
  environment: 'development',
  apiUrl: 'http://192.168.1.90:3000/api/trpc',
  isDev: true,
  expoConfig: { environment: 'development' }
}
```

## Customization

### Adding New Environments

1. Create a new app config file (e.g., `app.testing.json`)
2. Add the environment to `config/environment.ts`
3. Add scripts to `package.json`
4. Add build profile to `eas.json`

### Dynamic IP Detection

For development, you can create a script to automatically detect your local IP:

```javascript
// get-ip.js (already exists in your root)
const os = require("os");
const interfaces = os.networkInterfaces();
// ... IP detection logic
```

### Environment Variables

You can also use environment variables by modifying the detection logic in `config/environment.ts`:

```typescript
const getEnvironment = () => {
  if (process.env.NODE_ENV === "production") return "production";
  if (process.env.EXPO_ENV === "staging") return "staging";
  return "development";
};
```

## Troubleshooting

1. **Wrong URL being used**: Check the console logs for environment info
2. **Build issues**: Ensure the correct app config file exists
3. **Network errors**: Verify the backend URLs are accessible
4. **Environment not switching**: Clear Metro cache with `expo start --clear`

## Security Notes

- Never commit production API keys or sensitive URLs to version control
- Consider using environment variables for sensitive configuration
- Remove debug logging (`logEnvironmentInfo()`) in production builds
