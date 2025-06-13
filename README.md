# Grocery Monorepo

This is a monorepo containing a grocery application with the following components:

- `apps/frontend`: Expo-based mobile application
- `apps/backend`: Next.js-based backend server
- `packages/shared`: Shared code and types between frontend and backend

## Project Structure

```
.
├── apps/
│   ├── frontend/     # Expo mobile app
│   └── backend/      # Next.js backend
├── packages/
│   └── shared/       # Shared code and types
├── package.json
├── turbo.json
└── README.md
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages and applications
- `npm run start` - Start all production servers
- `npm run lint` - Run linting across all packages 