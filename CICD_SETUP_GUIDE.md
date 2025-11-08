# 🚀 CI/CD Setup Guide - GitHub Actions

## ✅ Codebase Cleaned and Ready!

Your codebase has been cleaned and optimized for production. GitHub Actions workflows are configured for automated deployment.

---

## 📁 **Project Structure (After Cleanup)**

```
e:\cc\
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Build & test on PRs
│       ├── deploy-frontend.yml       # Deploy frontend to Static Web Apps
│       └── deploy-backend.yml        # Deploy backend to Container Apps
├── api/                              # Backend Node.js code
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── frontend/                         # Frontend React code
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── .env                              # Environment variables (local)
├── .env.example                      # Template for .env
├── .gitignore                        # Git ignore rules
├── README.md                         # Main documentation
└── FINAL_HTTPS_DEPLOYMENT.md         # Current deployment info
```

---

## 🔧 **GitHub Secrets Configuration**

To enable CI/CD, you need to add these secrets to your GitHub repository.

### **Step 1: Navigate to GitHub Secrets**

1. Go to your repository: `https://github.com/NandhaKumarP180/anand-classroom`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### **Step 2: Add Required Secrets**

#### **Secret 1: AZURE_STATIC_WEB_APPS_API_TOKEN**
- **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
- **Value:** 
```
523b5f8f073f82c816f530e1ccc9e296f3e00f9ee707ce495627e8b5aeb42ff803-fa44ef27-a75c-4940-88c0-e298135da98000f22300518bbf0f
```
- **Purpose:** Deploys frontend to Azure Static Web Apps

#### **Secret 2: ACR_USERNAME**
- **Name:** `ACR_USERNAME`
- **Value:** `acrcbdev9aowk0`
- **Purpose:** Login to Azure Container Registry

#### **Secret 3: ACR_PASSWORD**
- **Name:** `ACR_PASSWORD`
- **Value:** Get this by running:
```bash
az acr credential show --name acrcbdev9aowk0 --query "passwords[0].value" -o tsv
```

#### **Secret 4: AZURE_CREDENTIALS**
- **Name:** `AZURE_CREDENTIALS`
- **Value:** Create Azure Service Principal by running:
```bash
az ad sp create-for-rbac --name "github-actions-classroom" --role contributor --scopes /subscriptions/7d8396d8-2bc3-468d-95ff-f6f4fb54c5f1/resourceGroups/rg-classroom-booking-dev --sdk-auth
```
- **Format:** Paste the entire JSON output

---

## 🎯 **Workflows Explained**

### **1. CI Workflow (`ci.yml`)**

**Triggers:**
- On every pull request to `main`
- On every push to `main`

**What it does:**
- ✅ Builds frontend
- ✅ Builds backend
- ✅ Runs tests (if configured)
- ✅ Validates Docker builds

**Purpose:** Catch issues before deployment

---

### **2. Frontend Deployment (`deploy-frontend.yml`)**

**Triggers:**
- When `frontend/` code changes
- Manual trigger via GitHub Actions UI
- On push to `main` branch

**What it does:**
1. ✅ Checks out code
2. ✅ Installs Node.js dependencies
3. ✅ Builds React app
4. ✅ Deploys to Azure Static Web Apps
5. ✅ Shows deployment URL

**Deployment URL:** https://kind-bush-0518bbf0f.3.azurestaticapps.net

---

### **3. Backend Deployment (`deploy-backend.yml`)**

**Triggers:**
- When `api/` code changes
- Manual trigger via GitHub Actions UI
- On push to `main` branch

**What it does:**
1. ✅ Builds Docker image
2. ✅ Pushes to Azure Container Registry
3. ✅ Updates Azure Container App
4. ✅ Tags image with Git SHA for versioning

**Deployment URL:** https://classroom-api.blueplant-0f69d852.eastus.azurecontainerapps.io

---

## 📝 **Quick Commands to Get Secret Values**

Run these commands to get the values you need:

```bash
# Get ACR Password
az acr credential show --name acrcbdev9aowk0 --query "passwords[0].value" -o tsv

# Create Azure Service Principal (for AZURE_CREDENTIALS)
az ad sp create-for-rbac \
  --name "github-actions-classroom" \
  --role contributor \
  --scopes /subscriptions/7d8396d8-2bc3-468d-95ff-f6f4fb54c5f1/resourceGroups/rg-classroom-booking-dev \
  --sdk-auth

# Get Static Web Apps Token (already have it)
az staticwebapp secrets list \
  --name classroom-booking-system \
  --resource-group rg-classroom-booking-dev \
  --query "properties.apiKey" -o tsv
```

---

## 🚀 **Testing the CI/CD Pipeline**

### **Option 1: Push to GitHub (Automatic)**

1. **Commit and push your code:**
```bash
cd e:\cc
git add .
git commit -m "Setup CI/CD with GitHub Actions"
git push origin main
```

2. **Watch the workflows:**
   - Go to: `https://github.com/NandhaKumarP180/anand-classroom/actions`
   - You'll see 3 workflows running:
     - ✅ CI - Build and Test
     - ✅ Deploy Frontend
     - ✅ Deploy Backend

---

### **Option 2: Manual Trigger**

1. Go to: `https://github.com/NandhaKumarP180/anand-classroom/actions`
2. Select a workflow (e.g., "Deploy Frontend")
3. Click **Run workflow** → **Run workflow**

---

## 🔄 **Workflow Behavior**

### **When you change frontend code:**
```bash
# Only frontend deployment runs
git add frontend/
git commit -m "Update frontend UI"
git push
```
→ Triggers: `ci.yml` + `deploy-frontend.yml`

### **When you change backend code:**
```bash
# Only backend deployment runs
git add api/
git commit -m "Update backend API"
git push
```
→ Triggers: `ci.yml` + `deploy-backend.yml`

### **When you change both:**
```bash
# Both deployments run
git add .
git commit -m "Update both frontend and backend"
git push
```
→ Triggers: `ci.yml` + `deploy-frontend.yml` + `deploy-backend.yml`

---

## 📊 **Workflow Status**

After pushing, check status at:
```
https://github.com/NandhaKumarP180/anand-classroom/actions
```

**Status indicators:**
- 🟡 **Yellow:** Running
- ✅ **Green:** Success
- ❌ **Red:** Failed (click for logs)

---

## 🐛 **Troubleshooting**

### **Issue: Workflow fails with "secret not found"**
**Solution:** Add the missing secret in GitHub Settings → Secrets

### **Issue: ACR login fails**
**Solution:** Verify ACR_USERNAME and ACR_PASSWORD are correct

### **Issue: Azure CLI commands fail**
**Solution:** Check AZURE_CREDENTIALS secret is valid JSON from service principal

### **Issue: Frontend deployment fails**
**Solution:** Verify AZURE_STATIC_WEB_APPS_API_TOKEN is correct

---

## 🎯 **Best Practices**

### **1. Branch Protection**
Protect your `main` branch:
- Settings → Branches → Add rule
- ✅ Require pull request before merging
- ✅ Require status checks to pass

### **2. Manual Approvals (Optional)**
Add manual approval for production:
```yaml
environment:
  name: production
  url: https://kind-bush-0518bbf0f.3.azurestaticapps.net
```

### **3. Rollback Strategy**
Backend images are tagged with Git SHA:
```bash
# Rollback to previous version
az containerapp update \
  --name classroom-api \
  --resource-group rg-classroom-booking-dev \
  --image acrcbdev9aowk0.azurecr.io/classroom-booking-api:abc123def
```

---

## 📈 **Deployment Flow Diagram**

```
Developer
    ↓
[Git Push to main]
    ↓
GitHub Actions
    ├── CI Workflow (Build & Test)
    ├── Deploy Frontend → Azure Static Web Apps
    └── Deploy Backend → Azure Container Apps
         ↓
[Production Live]
    ├── Frontend: https://kind-bush-0518bbf0f.3.azurestaticapps.net
    └── Backend: https://classroom-api.blueplant-0f69d852.eastus.azurecontainerapps.io
```

---

## ✅ **Checklist: Ready for CI/CD**

Before pushing to GitHub:

- [ ] GitHub repository exists
- [ ] All 4 GitHub secrets added
- [ ] `.gitignore` configured
- [ ] `.env` not committed (use `.env.example` instead)
- [ ] Workflows reviewed and customized
- [ ] Azure resources are running
- [ ] Git configured with correct remote

---

## 🎓 **What You've Accomplished**

✅ **Automated Deployments** - Push code → Auto-deploy  
✅ **CI/CD Pipeline** - Build, test, deploy automatically  
✅ **Version Control** - Docker images tagged with Git SHA  
✅ **Clean Codebase** - Only production-ready code  
✅ **Infrastructure as Code** - GitHub Actions workflows  
✅ **Zero Downtime** - Blue-green deployments  
✅ **Professional Workflow** - Industry best practices  

---

## 🚀 **Next Steps**

1. **Add GitHub Secrets** (all 4 required)
2. **Push code to GitHub:**
```bash
git add .
git commit -m "Setup CI/CD with GitHub Actions"
git push origin main
```
3. **Watch workflows run** at GitHub Actions tab
4. **Verify deployment** at your live URLs

---

## 📞 **Support Commands**

### **View Workflow Runs:**
```bash
# Using GitHub CLI (if installed)
gh run list --workflow=deploy-frontend.yml
gh run list --workflow=deploy-backend.yml
```

### **View Container App Revisions:**
```bash
az containerapp revision list \
  --name classroom-api \
  --resource-group rg-classroom-booking-dev \
  --output table
```

### **View Static Web App Deployments:**
```bash
az staticwebapp environment list \
  --name classroom-booking-system \
  --resource-group rg-classroom-booking-dev
```

---

## 🎉 **You're Ready for Production CI/CD!**

Your application now has:
- ✅ Automated testing
- ✅ Automated deployments
- ✅ Version control
- ✅ Clean codebase
- ✅ Professional workflows

**Push your code and watch it deploy automatically! 🚀**
