# Railway Environment Variables Setup

This document lists all required environment variables for both frontend and backend services on Railway.

## Backend Service Environment Variables

### Required Variables

```bash
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskpilot?retryWrites=true&w=majority

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Node Environment
NODE_ENV=production
```

### Optional Variables

```bash
# Logging Level (default: info)
LOG_LEVEL=info

# Public URL (Railway auto-provides RAILWAY_PUBLIC_DOMAIN, but you can override)
PUBLIC_URL=https://your-backend-domain.up.railway.app

# Server Port (Railway auto-provides PORT variable)
PORT=4000
```

### How to Generate JWT_SECRET

```bash
# On Linux/Mac:
openssl rand -base64 64

# Or Node.js:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Frontend Service Environment Variables

### Required Variables

```bash
# Backend GraphQL Endpoint
VITE_API_URL=https://your-backend-domain.up.railway.app/graphql
```

**Important:** Replace `your-backend-domain.up.railway.app` with your actual Railway backend URL.

### Optional Variables

```bash
# Node Environment
NODE_ENV=production

# Server Port (Railway auto-provides PORT variable)
PORT=3000
```

## Railway Service Configuration

### Backend Service

1. **Service Name:** `task-pilot-backend`
2. **Root Directory:** `backend`
3. **Build Command:** `npm ci && npm run build` (auto-detected via nixpacks.toml)
4. **Start Command:** `node dist/index.js` (auto-detected via nixpacks.toml)
5. **Health Check:** `/health`

### Frontend Service

1. **Service Name:** `task-pilot-frontend`
2. **Root Directory:** `frontend`
3. **Build Command:** `npm ci && npm run build` (auto-detected via nixpacks.toml)
4. **Start Command:** `./start.sh` (auto-detected via nixpacks.toml)
5. **Health Check:** `/`

## Setup Order

### 1. Deploy Backend First

```bash
# In Railway dashboard:
1. Create new project
2. Add service from GitHub repo
3. Set root directory to: backend
4. Add environment variables (see Backend section above)
5. Deploy and wait for success
6. Copy the generated Railway domain (e.g., task-pilot-backend.up.railway.app)
```

### 2. Deploy Frontend Second

```bash
# In Railway dashboard:
1. Add new service to same project
2. Connect same GitHub repo
3. Set root directory to: frontend
4. Add VITE_API_URL with backend URL from step 1
5. Deploy and wait for success
```

## MongoDB Setup

If you don't have MongoDB yet:

### Option 1: MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist Railway IPs (or use 0.0.0.0/0 for testing)
5. Get connection string
6. Replace `<username>`, `<password>`, and `<cluster>` in MONGO_URI

### Option 2: Railway MongoDB Plugin

1. In Railway project, click "New" → "Database" → "Add MongoDB"
2. Railway will auto-generate MONGO_URI
3. Use the provided connection string

## Verifying Deployment

### Backend Health Check

```bash
curl https://your-backend-domain.up.railway.app/health
# Should return: {"status":"ok"}
```

### Frontend Health Check

```bash
curl https://your-frontend-domain.up.railway.app/
# Should return: HTML content (200 OK)
```

### Test GraphQL

```bash
curl -X POST https://your-backend-domain.up.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
# Should return: {"data":{"__typename":"Query"}}
```

## Common Issues

### Backend: "MONGO_URI not defined"

**Solution:** Add MONGO_URI environment variable in Railway dashboard.

### Frontend: "Network request failed"

**Solution:** 
1. Check VITE_API_URL is correct (must end with /graphql)
2. Verify backend is deployed and healthy
3. Check backend CORS includes Railway frontend domain (already configured)

### Backend: "Not allowed by CORS"

**Solution:** Backend already allows Railway domains via `/\.railway\.app$/` regex. If using custom domain, add it to `allowedOrigins` in `backend/src/index.ts`.

### Build Fails: "Module not found"

**Solution:** 
1. Check nixpacks.toml is in correct directory
2. Verify package.json has all dependencies
3. Try redeploying

### Health Check Timeout

**Solution:**
1. Check service is listening on `0.0.0.0:$PORT`
2. Verify health check endpoint returns 200
3. Check Railway logs for errors

## Environment Variables Checklist

### Before Deploying Backend:
- [ ] MONGO_URI set
- [ ] JWT_SECRET set (random, secure)
- [ ] NODE_ENV=production

### Before Deploying Frontend:
- [ ] VITE_API_URL set (with backend Railway URL + /graphql)
- [ ] Backend is deployed and healthy

### After Both Deployed:
- [ ] Backend health check returns 200
- [ ] Frontend loads in browser
- [ ] Can register/login users
- [ ] Can create projects and tasks

## Railway Dashboard URLs

- Project Dashboard: https://railway.app/project/YOUR_PROJECT_ID
- Backend Service: https://railway.app/project/YOUR_PROJECT_ID/service/backend
- Frontend Service: https://railway.app/project/YOUR_PROJECT_ID/service/frontend

## Support

If issues persist:
1. Check Railway deployment logs
2. Check Railway build logs
3. Verify all environment variables are set
4. Test backend health endpoint directly
5. Check MongoDB connection

## Security Notes

- Never commit `.env` files to Git
- Use strong, random JWT_SECRET (64+ characters)
- Rotate JWT_SECRET periodically in production
- Use MongoDB Atlas IP whitelisting when possible
- Keep dependencies updated
