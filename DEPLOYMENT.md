# Deployment Setup for Vercel

This document explains how to set up GitHub Actions to automatically deploy your backend and frontend to Vercel.
testing

## Prerequisites

1. **Vercel Account**: Make sure you have a Vercel account
2. **Vercel CLI**: Install globally with `npm install -g vercel`
3. **GitHub Repository**: Your code should be in a GitHub repository

## Setup Steps

### 1. Create Vercel Projects

First, create two separate projects on Vercel. You have two options:

#### Option A: Create Projects via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Create two separate projects:
   - One for the backend (set root directory to `apps/backend`)
   - One for the frontend (set root directory to `apps/frontend`)
5. Note the project IDs from each project's settings

#### Option B: Create Projects via CLI

**Backend Project:**

```bash
cd apps/backend
vercel
```

When prompted:

- Choose "Link to existing project?" → No
- Enter project name (e.g., "your-app-backend")
- Choose your scope/team
- Link to current directory? → Yes

**Frontend Project:**

```bash
cd apps/frontend
vercel
```

When prompted:

- Choose "Link to existing project?" → No
- Enter project name (e.g., "your-app-frontend")
- Choose your scope/team
- Link to current directory? → Yes

**Important:** The initial `vercel` command (without `--prod`) creates the project and does a preview deployment. The GitHub Actions workflow will handle production deployments automatically.

### 2. Get Vercel Credentials

Run the following commands to get your credentials:

```bash
# Get your Vercel token (keep this secure)
vercel whoami

# Get your organization ID
vercel teams list

# Get project IDs (if you missed them during creation)
vercel projects list
```

### 3. Configure GitHub Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add these secrets:

- `VERCEL_TOKEN`: Your Vercel authentication token
- `VERCEL_ORG_ID`: Your Vercel organization/team ID
- `VERCEL_PROJECT_ID_BACKEND`: The project ID for your backend
- `VERCEL_PROJECT_ID_FRONTEND`: The project ID for your frontend

### 4. Environment Variables

Make sure to configure any necessary environment variables in your Vercel project settings:

#### Backend Environment Variables

- Database connection strings
- API keys
- Any other backend-specific environment variables

#### Frontend Environment Variables

- API endpoints
- Any frontend-specific configuration

### 5. Deploy

Once everything is set up, the deployment will trigger automatically when you:

- Push to the `main` branch
- Create a pull request to the `main` branch

## Manual Deployment

You can also deploy manually using the Vercel CLI:

```bash
# Deploy backend
cd apps/backend
vercel --prod

# Deploy frontend
cd apps/frontend
vercel --prod
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are properly listed in package.json
2. **Environment Variables**: Ensure all required environment variables are set in Vercel
3. **Database Connections**: Make sure your database is accessible from Vercel's servers

### Logs

You can view deployment logs in:

- GitHub Actions tab in your repository
- Vercel dashboard for each project
- Vercel CLI: `vercel logs [deployment-url]`

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── apps/
│   ├── backend/
│   │   ├── vercel.json         # Backend Vercel configuration
│   │   └── ...
│   └── frontend/
│       ├── vercel.json         # Frontend Vercel configuration
│       └── ...
└── turbo.json                  # Turborepo configuration
```

## Notes

- The backend is deployed as a Next.js application
- The frontend is deployed as a static Expo web build
- Both deployments run in parallel for faster deployment times
- The workflow only deploys on pushes to the main branch and pull requests
