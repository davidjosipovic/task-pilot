# AWS Deployment Guide for TaskPilot

## Architecture
- **Frontend**: AWS Amplify (React/Vite)
- **Backend**: AWS Elastic Beanstalk or ECS (Docker)
- **Database**: MongoDB Atlas (free tier) or AWS DocumentDB

## Option 1: AWS Amplify + Elastic Beanstalk (Recommended - Easiest)

### Step 1: Deploy Frontend to AWS Amplify

1. **Login to AWS Console**: https://console.aws.amazon.com
2. **Go to AWS Amplify**: Search for "Amplify" in services
3. **Create New App**:
   - Click "New app" → "Host web app"
   - Select "GitHub" as source
   - Authorize AWS Amplify to access your GitHub
   - Select repository: `davidjosipovic/task-pilot`
   - Select branch: `main`
4. **Configure Build Settings**:
   - Build settings are auto-detected from `amplify.yml`
   - Monorepo root: `frontend`
5. **Environment Variables**:
   - Add `VITE_API_URL`: (will get this after backend deployment)
6. **Deploy**: Click "Save and deploy"

### Step 2: Setup MongoDB Atlas (Database)

1. **Go to**: https://www.mongodb.com/cloud/atlas
2. **Create Free Account** and login
3. **Create Cluster**:
   - Choose AWS as provider
   - Select region closest to you (e.g., us-east-1)
   - Choose M0 (Free tier)
4. **Create Database User**:
   - Database Access → Add New User
   - Username: `taskpilot`
   - Password: Generate secure password (save it!)
5. **Network Access**:
   - Network Access → Add IP Address
   - Click "Allow access from anywhere" (0.0.0.0/0)
6. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string: `***REMOVED***
   - Replace `<password>` with your actual password

### Step 3: Deploy Backend to AWS Elastic Beanstalk

#### Install EB CLI:
```bash
pip install awsebcli --upgrade --user
```

#### Initialize and Deploy:
```bash
cd /home/David/Documents/GithubRepos/task-pilot/backend

# Initialize Elastic Beanstalk
eb init -p docker task-pilot-backend --region us-east-1

# Create environment
eb create task-pilot-backend-env

# Set environment variables
eb setenv MONGO_URI="***REMOVED***
  JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long" \
  NODE_ENV="production" \
  PORT="4000"

# Deploy
eb deploy

# Get your backend URL
eb status
```

### Step 4: Update Frontend Environment Variable

1. Go back to AWS Amplify console
2. Click on your app → "Environment variables"
3. Add/Update `VITE_API_URL` with your backend URL from EB
   - Example: `https://task-pilot-backend-env.us-east-1.elasticbeanstalk.com/graphql`
4. Redeploy frontend: "Redeploy this version"

### Step 5: Update CORS in Backend

Update `backend/src/index.ts` to allow your Amplify domain:
```typescript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://main.xxxxxx.amplifyapp.com', // Your Amplify URL
  ],
  credentials: true,
};
```

Then redeploy backend:
```bash
eb deploy
```

---

## Option 2: Full AWS ECS with Docker Compose

### Prerequisites:
```bash
# Install AWS Copilot CLI
curl -Lo copilot https://github.com/aws/copilot-cli/releases/latest/download/copilot-linux && chmod +x copilot && sudo mv copilot /usr/local/bin/copilot
```

### Deploy:
```bash
cd /home/David/Documents/GithubRepos/task-pilot

# Initialize application
copilot app init task-pilot

# Create backend service
cd backend
copilot svc init --name backend --svc-type "Load Balanced Web Service" --dockerfile ./Dockerfile.prod

# Create frontend service
cd ../frontend
copilot svc init --name frontend --svc-type "Load Balanced Web Service" --dockerfile ./Dockerfile

# Deploy environment
copilot env init --name production --profile default --default-config

# Deploy services
copilot svc deploy --name backend --env production
copilot svc deploy --name frontend --env production
```

---

## Option 3: AWS Amplify Only (Full Stack)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in project
cd /home/David/Documents/GithubRepos/task-pilot
amplify init

# Add hosting
amplify add hosting

# Add API (GraphQL)
amplify add api

# Push to AWS
amplify push

# Publish
amplify publish
```

---

## Costs Estimate

**Free Tier (First Year)**:
- AWS Amplify: 1000 build minutes/month free, then $0.01/build minute
- Elastic Beanstalk: Free (pay only for EC2 - t2.micro is free tier)
- MongoDB Atlas: M0 cluster free forever
- **Total**: ~$0-5/month in free tier

**After Free Tier**:
- Amplify: ~$5-10/month (depending on traffic)
- Elastic Beanstalk (t2.small): ~$15/month
- **Total**: ~$20-25/month

---

## Environment Variables Needed

### Backend (Elastic Beanstalk):
- `MONGO_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Minimum 32 characters, randomly generated
- `NODE_ENV`: production
- `PORT`: 4000

### Frontend (Amplify):
- `VITE_API_URL`: Your backend GraphQL endpoint

---

## Post-Deployment

### Get Your URLs:
```bash
# Backend URL
eb status | grep CNAME

# Frontend URL - check Amplify console
```

### Monitor Logs:
```bash
# Backend logs
eb logs

# Frontend logs - check Amplify console
```

### Update GitHub README with live URLs:
```markdown
## 🚀 Live Demo
- **Frontend**: https://main.xxxxxx.amplifyapp.com
- **Backend API**: https://task-pilot-backend-env.us-east-1.elasticbeanstalk.com/graphql
```

---

## Troubleshooting

### Backend won't start:
```bash
eb logs
# Check for MongoDB connection issues
```

### Frontend can't connect to backend:
- Verify CORS settings in backend
- Check VITE_API_URL is correct
- Ensure backend is running: visit backend URL in browser

### Database connection timeout:
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify MONGO_URI is correct

---

## CI/CD Integration

Your GitHub Actions workflow will automatically test on every push. To add automatic deployment:

1. Add AWS credentials to GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. Add deployment job to `.github/workflows/ci.yml`:
```yaml
  deploy-backend:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy to Elastic Beanstalk
        run: |
          pip install awsebcli
          cd backend
          eb deploy task-pilot-backend-env
```

---

## Next Steps After Deployment

1. ✅ Get live URLs from AWS
2. ✅ Update README.md with live demo links
3. ✅ Add AWS badges to README
4. ✅ Test production app end-to-end
5. ✅ Set up custom domain (optional)
6. ✅ Apply for Elixirr Digital job!

