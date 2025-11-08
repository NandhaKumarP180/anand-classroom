@echo off
echo ========================================
echo Cleaning Up Codebase for Production
echo ========================================
echo.
echo This will remove:
echo - Old deployment scripts
echo - Docker local development files (keeping Dockerfiles)
echo - Terraform files (we use Azure CLI now)
echo - Test/troubleshooting documentation
echo - Redundant documentation files
echo.
pause

REM Remove old deployment and test scripts
echo Removing old deployment scripts...
del /q "EXTERNAL_ACCESS_TROUBLESHOOTING.md" 2>nul
del /q "TEST_INSTRUCTIONS.md" 2>nul
del /q "DOCKER_README.md" 2>nul
del /q "LOCAL_DEVELOPMENT_README.md" 2>nul

REM Remove Docker Compose files (not needed for Azure)
echo Removing Docker Compose files...
del /q "docker-compose.yml" 2>nul
del /q "docker-build.cmd" 2>nul
del /q "docker-start.cmd" 2>nul
del /q "docker-stop.cmd" 2>nul
del /q "docker-logs.cmd" 2>nul
del /q "docker-rebuild.cmd" 2>nul
del /q "START_LOCAL.cmd" 2>nul

REM Remove Terraform files (using Azure CLI for deployment)
echo Removing Terraform files...
rmdir /s /q "terraform" 2>nul

REM Remove old documentation
echo Removing old documentation...
del /q "PRODUCTION_DEPLOYMENT_SUMMARY.md" 2>nul
del /q "UPDATED_DEPLOYMENT_INFO.md" 2>nul
del /q "QUICK_SHARE.txt" 2>nul

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Remaining files:
echo - README.md (Main documentation)
echo - FINAL_HTTPS_DEPLOYMENT.md (Current deployment info)
echo - .env (Environment variables)
echo - .env.example (Template)
echo - api/ (Backend source code)
echo - frontend/ (Frontend source code)
echo.
echo Ready for CI/CD setup!
pause
