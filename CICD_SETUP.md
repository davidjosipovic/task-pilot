# CI/CD Auto-Deployment Setup

Your GitHub Actions workflow is now configured to automatically deploy to AWS Elastic Beanstalk on every push to `main` branch!

## Setup AWS Credentials in GitHub

### Step 1: Create AWS IAM User for Deployment

1. **Go to AWS IAM Console**: https://console.aws.amazon.com/iam/
2. **Click "Users"** → **"Create user"**
3. **User name**: `github-actions-deployer`
4. **Click "Next"**

### Step 2: Set Permissions

1. **Attach policies directly**
2. **Add these policies**:
   - `AWSElasticBeanstalkFullAccess`
   - `AmazonS3FullAccess` (for deployment artifacts)
3. **Click "Next"** → **"Create user"**

### Step 3: Create Access Keys

1. **Click on the user** you just created
2. **Security credentials** tab
3. **Create access key**
4. **Use case**: Select "Application running outside AWS"
5. **Click "Next"** → **"Create access key"**
6. **SAVE BOTH**:
   - ✅ Access Key ID (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - ✅ Secret Access Key (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

### Step 4: Add Secrets to GitHub

1. **Go to your GitHub repo**: https://github.com/davidjosipovic/task-pilot
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. **Add these two secrets**:

   **Secret 1:**
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: Your access key ID from Step 3

   **Secret 2:**
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: Your secret access key from Step 3

5. **Save**

## How It Works

Once you add the secrets, your workflow will:

1. ✅ Run on every push to `main` branch
2. ✅ Run all tests (backend + frontend)
3. ✅ Build Docker images
4. ✅ **Automatically deploy backend to AWS Elastic Beanstalk**
5. ✅ AWS Amplify auto-deploys frontend (already configured)

## Workflow Stages

```
Push to GitHub (main branch)
    ↓
Run Backend Tests (Jest)
    ↓
Run Frontend Tests (Vitest)
    ↓
Build Docker Images
    ↓
Deploy Backend to AWS EB ✨ (NEW!)
    ↓
Frontend deploys via Amplify (automatic)
    ↓
🎉 Both deployed!
```

## Test the Auto-Deployment

After adding the secrets, make a small change and push:

```bash
# Make a change (e.g., edit README)
echo "# Auto-deployment active!" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deployment"
git push

# Watch GitHub Actions tab for deployment progress
```

## Monitor Deployments

- **GitHub Actions**: https://github.com/davidjosipovic/task-pilot/actions
- **AWS EB Console**: https://console.aws.amazon.com/elasticbeanstalk/home?region=us-east-1
- **AWS Amplify**: https://console.aws.amazon.com/amplify/home?region=us-east-1

## Troubleshooting

### Deployment fails with "unauthorized"
- Check that AWS credentials are correct in GitHub Secrets
- Verify IAM user has correct permissions

### EB CLI can't find environment
- Ensure `.elasticbeanstalk/config.yml` is committed to GitHub
- Check environment name matches in workflow file

### Tests fail
- Fix the failing tests first
- Deployment only runs if all tests pass

## Security Best Practices

✅ Never commit AWS credentials to code
✅ Use GitHub Secrets for sensitive data
✅ Use IAM user with minimal required permissions
✅ Rotate access keys periodically
✅ Monitor CloudWatch for suspicious activity

## Benefits

- 🚀 **Zero-downtime deployments**: AWS handles rolling updates
- ✅ **Automated testing**: Catches bugs before deployment
- 🔄 **Continuous delivery**: Push to main = automatic deployment
- 📊 **Deployment history**: Track all deployments in GitHub Actions
- 🎯 **Production-ready**: Professional CI/CD pipeline
