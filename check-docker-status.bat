@echo off
echo 🔍 Checking Docker Services Status
echo ================================
echo.

echo Step 1: Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop and try again
    pause
    exit /b 1
)

echo ✅ Docker is available

echo.
echo Step 2: Checking Docker services...
docker-compose ps

echo.
echo Step 3: If services are not running, starting them...
docker-compose up -d

echo.
echo Step 4: Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo Step 5: Final status check...
docker-compose ps

echo.
echo Step 6: Testing Elasticsearch connection...
cd backend
node simple-elasticsearch-test.js

echo.
echo 🎯 Docker services check completed!
pause
