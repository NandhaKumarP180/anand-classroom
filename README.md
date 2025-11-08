# 🎓 Classroom Booking System

[![CI](https://github.com/NandhaKumarP180/anand-classroom/actions/workflows/ci.yml/badge.svg)](https://github.com/NandhaKumarP180/anand-classroom/actions/workflows/ci.yml)
[![Deploy Frontend](https://github.com/NandhaKumarP180/anand-classroom/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/NandhaKumarP180/anand-classroom/actions/workflows/deploy-frontend.yml)
[![Deploy Backend](https://github.com/NandhaKumarP180/anand-classroom/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/NandhaKumarP180/anand-classroom/actions/workflows/deploy-backend.yml)

A production-ready, full-stack classroom booking system with automated CI/CD deployment to Azure.

## 🌐 Live Application

**Production URLs:**
- **Frontend:** https://kind-bush-0518bbf0f.3.azurestaticapps.net
- **Backend API:** https://classroom-api.blueplant-0f69d852.eastus.azurecontainerapps.io/api

## 🚀 Quick Deploy

**Automatic deployment via GitHub Actions:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```
The CI/CD pipeline will automatically deploy your changes!

---

## 📁 Project Structure

```
classroom-booking-system/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── ci.yml             # Build & test
│       ├── deploy-frontend.yml # Auto-deploy frontend
│       └── deploy-backend.yml  # Auto-deploy backend
├── api/                        # Backend Node.js API
│   ├── Dockerfile             # Container image
│   ├── simple-server.js       # Main server
│   └── package.json
├── frontend/                   # React Frontend
│   ├── Dockerfile             # Container image
│   ├── src/                   # Source code
│   └── package.json
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── CICD_SETUP_GUIDE.md        # CI/CD setup instructions
└── README.md                  # This file
```

---

## ✨ Features

### For Students:
- 📅 View available classrooms
- 🔖 Book a classroom
- 📋 View your bookings
- 🤖 AI-powered room suggestions

### For Admins:
- ✅ Approve/Deny bookings
- 📊 View all bookings
- 🏢 Manage classrooms
- 🔑 Access with passphrase: `admin123`

---

## 🗄️ Database

**Azure Cosmos DB:**
- Database: `classroom-db`
- Containers: `rooms`, `bookings`
- Endpoint: https://anand-classroom-db.documents.azure.com:443/
- Location: East US

---

## 🔧 CI/CD Configuration

**GitHub Secrets Required:**
1. `AZURE_STATIC_WEB_APPS_API_TOKEN` - Frontend deployment
2. `ACR_USERNAME` - Container Registry login
3. `ACR_PASSWORD` - Container Registry password
4. `AZURE_CREDENTIALS` - Azure Service Principal

**Setup Guide:** See `CICD_SETUP_GUIDE.md` for detailed instructions.

---

## 🧪 CI/CD Pipeline

**Automated Testing:**
- ✅ Build verification on every PR
- ✅ Automated frontend deployment
- ✅ Automated backend deployment
- ✅ Docker image versioning

**Manual Trigger:**
Go to Actions tab → Select workflow → Run workflow

---

## 📦 Tech Stack

**Frontend:**
- React 18 + Vite
- Azure Static Web Apps (FREE tier)
- HTTPS with SSL
- Global CDN

**Backend:**
- Node.js
- Azure Container Apps
- HTTPS with SSL
- Auto-scaling (0-10 replicas)

**Database:**
- Azure Cosmos DB (NoSQL)

**DevOps:**
- GitHub Actions for CI/CD
- Docker containerization
- Azure Container Registry

---

## 🐛 Troubleshooting

**CI/CD workflow fails:**
- Check GitHub secrets are configured
- Review workflow logs in Actions tab
- Verify Azure resources are running

**Deployment fails:**
- Check Azure Container Registry credentials
- Verify Azure Container Apps is healthy
- Review deployment logs in Azure Portal

---

## 📚 Documentation

- **`CICD_SETUP_GUIDE.md`** - Complete CI/CD setup instructions
- **`FINAL_HTTPS_DEPLOYMENT.md`** - Current Azure deployment details
- **`.env.example`** - Environment variables template

---

## 🎯 Development Workflow

1. **Clone repository**
2. **Create feature branch:** `git checkout -b feature/your-feature`
3. **Make changes** to code
4. **Commit and push:** `git push origin feature/your-feature`
5. **Create Pull Request** - CI will run automatically
6. **Merge to main** - Auto-deploys to production!

---

## 💰 Monthly Costs

- Frontend: **FREE** (Azure Static Web Apps)
- Backend: ~$15/month (Azure Container Apps)
- Registry: ~$5/month (Azure Container Registry)
- Monitoring: ~$2.50/month (Application Insights)
- **Total: ~$22.50/month**

---

## 🏆 Production Features

✅ **Full HTTPS** - End-to-end encryption
✅ **Auto-scaling** - Backend scales 0-10 replicas
✅ **Global CDN** - Fast worldwide access
✅ **CI/CD** - Automated deployments
✅ **Zero Downtime** - Blue-green deployments
✅ **Monitoring** - Application Insights
✅ **Version Control** - Docker images tagged with Git SHA

---

## 📞 Support

**GitHub Actions:** https://github.com/NandhaKumarP180/anand-classroom/actions
**Azure Portal:** https://portal.azure.com

---

## ✅ Production Ready!

**Your application is live and automatically deployed!**

🌐 https://kind-bush-0518bbf0f.3.azurestaticapps.net

**Happy coding!** 🚀
