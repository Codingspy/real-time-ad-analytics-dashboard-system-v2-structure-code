@echo off
echo 🚀 Starting All Services for Ad Analytics Dashboard
echo ================================================
echo.

echo Step 1: Starting Docker services (MongoDB, Redis, Elasticsearch, Kibana)...
cd ..
docker-compose up -d

echo.
echo Step 2: Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Step 3: Checking service status...
docker-compose ps

echo.
echo Step 4: Starting backend server...
cd backend
npm run dev

pause
