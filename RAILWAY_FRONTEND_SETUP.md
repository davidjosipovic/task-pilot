# Railway Frontend Deployment Guide

This guide explains how to deploy the TaskPilot frontend to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository connected to Railway

## Setup Instructions

### 1. Create New Railway Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your `task-pilot` repository
4. Railway will detect it's a monorepo

### 2. Configure Frontend Service

1. Click "Add a new service"
2. Select "GitHub Repo"
3. Choose the same repository
4. Click on the service settings (⚙️)
5. Configure the following:

#### Root Directory
```
frontend
```

#### Build Command (if not auto-detected)
```
npm ci && npm run build
```

#### Start Command (if not auto-detected)
```
npm run start
```

### 3. Environment Variables

Add the following environment variable in Railway dashboard:

```
VITE_GRAPHQL_URI=<your-backend-railway-url>/graphql
```

Replace `<your-backend-railway-url>` with your actual Railway backend URL (e.g., `https://task-pilot-backend-production.up.railway.app`)

**Important:** After adding the environment variable, you need to redeploy for changes to take effect.

### 4. Domain Configuration (Optional)

Railway provides a default domain like `task-pilot-frontend.up.railway.app`

To use a custom domain:
1. Go to service Settings → Networking
2. Click "Generate Domain" for the default Railway domain
3. Or add your custom domain and configure DNS

### 5. Verify Deployment

Once deployed, visit your Railway URL. You should see the TaskPilot frontend running.

Check that:
- ✅ Frontend loads correctly
- ✅ Dark mode toggle works
- ✅ GraphQL connection to backend works
- ✅ Login and registration work

## Project Structure

```
frontend/
├── railway.toml          # Railway configuration
├── package.json          # Includes "start" script for production
├── vite.config.ts        # Vite configuration
└── dist/                 # Built files (generated after build)
```

## Troubleshooting

### Build Fails

**Issue:** Build command fails during deployment

**Solution:** Check Railway build logs. Common issues:
- Node version mismatch (Railway uses Node 18+ by default)
- Missing dependencies
- TypeScript errors

### CORS Errors

**Issue:** Frontend can't connect to backend

**Solution:** Update backend CORS configuration to allow Railway frontend domain:

```typescript
// backend/src/index.ts
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://task-pilot-frontend.up.railway.app',  // Add your Railway domain
    // Add custom domain if configured
  ],
  credentials: true
};
```

### Environment Variables Not Working

**Issue:** VITE_GRAPHQL_URI not updating

**Solution:** 
1. Environment variables must start with `VITE_` to be accessible in the frontend
2. After changing environment variables, you must **redeploy** (not just restart)
3. Click "Deploy" or push a new commit to trigger rebuild

### Port Issues

**Issue:** Application not responding

**Solution:** Railway automatically provides `$PORT` environment variable. The start script uses it:
```json
"start": "vite preview --host 0.0.0.0 --port $PORT"
```

Make sure this script exists in `package.json`.

## Continuous Deployment

Railway automatically deploys on every push to your main branch. To disable:
1. Go to service Settings → Deploys
2. Toggle off "Auto Deploy"

## Cost Considerations

Railway offers:
- **Free Tier:** $5 credit per month (enough for small projects)
- **Pro Plan:** $20/month with additional usage credits
- Static sites use minimal resources (frontend is lightweight)

Frontend typically uses ~0.5-1 GB RAM and minimal CPU.

## Removing AWS Amplify

After successful Railway deployment:

1. Go to AWS Amplify Console
2. Select your app
3. Click "Actions" → "Delete app"
4. Confirm deletion

## Comparison: Railway vs AWS Amplify

| Feature | Railway | AWS Amplify |
|---------|---------|-------------|
| Setup Complexity | Simple | Moderate |
| Monorepo Support | Excellent | Good |
| Environment Variables | Easy | Easy |
| Custom Domains | Free | Free |
| Pricing | $5/month free credit | Free tier available |
| Build Speed | Fast | Fast |
| Developer Experience | Excellent | Good |

## Next Steps

- Configure custom domain
- Set up staging environment (create branch-based deploys)
- Monitor deployment logs
- Consider Railway's monitoring and metrics

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Your repository issues page
