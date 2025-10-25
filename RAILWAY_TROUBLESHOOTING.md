# Railway Deployment Troubleshooting

## Current Configuration

### Backend
- **Config file:** `backend/railway.json`
- **Build:** `npm ci && npm run build`
- **Start:** `node dist/index.js`
- **Health check:** `/health`

### Frontend
- **Config file:** `frontend/railway.toml`
- **Build:** `npm ci && npm run build && chmod +x start.sh`
- **Start:** `./start.sh`
- **Health check:** `/`

## Health Check Failures

### Check 1: Verify Service is Running

**Backend:**
```bash
# Railway logs should show:
🚀 Server running on port XXXX
✅ Connected to MongoDB
✅ GraphQL server started
```

**Frontend:**
```bash
# Railway logs should show:
Starting server on 0.0.0.0:XXXX
Serving directory: /app/dist
INFO  Accepting connections at http://0.0.0.0:XXXX
```

### Check 2: Test Health Endpoints Locally

**Backend:**
```bash
# In Railway deployment logs, find the public URL
curl https://your-backend.up.railway.app/health
# Should return: {"status":"ok"}
```

**Frontend:**
```bash
curl -I https://your-frontend.up.railway.app/
# Should return: HTTP/2 200
```

### Check 3: Verify Environment Variables

**Backend needs:**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Random secure string
- `NODE_ENV=production`
- `PORT` - Auto-provided by Railway

**Frontend needs:**
- `VITE_API_URL` - Backend GraphQL URL (https://backend.up.railway.app/graphql)
- `PORT` - Auto-provided by Railway

### Check 4: Build Logs

Look for these in Railway build logs:

**Backend build should show:**
```
> backend@1.0.0 build
> tsc
✓ TypeScript compiled successfully
```

**Frontend build should show:**
```
> frontend@0.0.0 build
> tsc -b && vite build
✓ built in XXXs
dist/index.html
dist/assets/...
```

## Common Issues

### 1. "Module not found" during build

**Cause:** Missing dependencies in package.json

**Fix:**
```bash
# Locally, ensure all deps are in package.json:
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### 2. Backend: "MONGO_URI not defined"

**Cause:** Environment variable not set in Railway

**Fix:**
1. Go to Railway backend service
2. Click "Variables"
3. Add `MONGO_URI` with your MongoDB connection string
4. Redeploy

### 3. Frontend: "dist directory not found"

**Cause:** Build failed or start command runs before build completes

**Fix:** Check Railway build logs for errors. Ensure `npm run build` succeeds.

### 4. "Health check timeout"

**Cause:** Service not listening on correct host/port

**Backend Fix:** Code already listens on `0.0.0.0:$PORT` ✓

**Frontend Fix:** `start.sh` already uses `0.0.0.0:$PORT` ✓

### 5. "serve: command not found"

**Cause:** `serve` package not installed

**Fix:** Ensure `serve` is in `frontend/package.json` dependencies (already done ✓)

### 6. "Permission denied: ./start.sh"

**Cause:** Script not executable

**Fix:** Build command includes `chmod +x start.sh` (already done ✓)

## Railway Service Settings

### Backend Service

1. **Root Directory:** `backend`
2. **Region:** Choose closest to users
3. **Instance:** Starter (512MB RAM should be enough)

### Frontend Service

1. **Root Directory:** `frontend`
2. **Region:** Same as backend for low latency
3. **Instance:** Starter (256MB RAM is enough for static serving)

## Restart Services

If health checks still fail after fixes:

1. Go to Railway dashboard
2. Click on failing service
3. Click "Deployments" tab
4. Click "Restart" on latest deployment

Or trigger new deployment:
```bash
git commit --allow-empty -m "Trigger Railway redeploy"
git push
```

## Debugging Steps

### 1. Check Railway Logs

```bash
# In Railway dashboard:
Service → Deployments → View Logs
```

Look for:
- Build errors
- Startup errors
- Port binding messages
- Health check attempts

### 2. Test Locally

**Backend:**
```bash
cd backend
npm ci
npm run build
PORT=4000 MONGO_URI=your-mongo-uri JWT_SECRET=test node dist/index.js
# Visit http://localhost:4000/health
```

**Frontend:**
```bash
cd frontend
npm ci
npm run build
PORT=3000 ./start.sh
# Visit http://localhost:3000
```

### 3. Verify CORS

If frontend loads but can't connect to backend:

1. Check backend logs for CORS errors
2. Verify `allowedOrigins` includes Railway domains (already configured ✓)
3. Test with curl:
```bash
curl -H "Origin: https://your-frontend.up.railway.app" \
     https://your-backend.up.railway.app/graphql
```

## Success Checklist

- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] Backend health check returns 200
- [ ] Frontend health check returns 200
- [ ] Environment variables are set
- [ ] MongoDB connection works
- [ ] Frontend can reach backend GraphQL
- [ ] Can register/login users
- [ ] Can create projects and tasks

## Still Not Working?

1. **Delete and recreate services:**
   - Railway sometimes caches bad configs
   - Remove service, create new one from scratch

2. **Check Railway status:**
   - Visit https://railway.statuspage.io
   - Outages can cause deployment issues

3. **Review recent commits:**
   - Check if recent code changes broke something
   - Try reverting to last working commit

4. **Contact Railway support:**
   - Railway Discord: https://discord.gg/railway
   - Provide: Service logs, error messages, Railway URL

## Quick Test Commands

```bash
# Backend health
curl https://YOUR-BACKEND.up.railway.app/health

# Frontend loads
curl -I https://YOUR-FRONTEND.up.railway.app/

# GraphQL works
curl -X POST https://YOUR-BACKEND.up.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{__typename}"}'

# Test from frontend
curl -H "Origin: https://YOUR-FRONTEND.up.railway.app" \
     https://YOUR-BACKEND.up.railway.app/graphql
```

Replace `YOUR-BACKEND` and `YOUR-FRONTEND` with your actual Railway URLs.
