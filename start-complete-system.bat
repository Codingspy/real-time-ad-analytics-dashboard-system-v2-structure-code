@echo off
echo 🚀 Starting Complete Ad Analytics System
echo ======================================
echo.

echo Step 1: Starting Docker services (MongoDB, Redis, Elasticsearch, Kibana)...
docker-compose up -d

echo.
echo Step 2: Waiting for services to be ready...
timeout /t 20 /nobreak >nul

echo.
echo Step 3: Checking service status...
docker-compose ps

echo.
echo Step 4: Setting up backend environment...
cd backend
if not exist .env (
    echo Creating .env file from example...
    copy env.example .env
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)

echo.
echo Step 5: Installing backend dependencies...
npm install

echo.
echo Step 6: Creating default users in database...
node fix-login.js

echo.
echo Step 7: Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Step 8: Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo Step 9: Starting frontend...
cd ..
start "Frontend" cmd /k "npm run dev"

echo.
echo 🎯 Complete system startup initiated!
echo.
echo 📋 Service URLs:
echo - Frontend: http://localhost:3000 (or 3001/3002 if 3000 is busy)
echo - Backend API: http://localhost:5000
echo - Elasticsearch: http://localhost:9200
echo - Kibana: http://localhost:5601
echo.
echo 🔐 Default Login Credentials:
echo - admin@adanalytics.com / AdAnalytics2024!Admin
echo - manager@adanalytics.com / AdAnalytics2024!Manager
echo - analyst@adanalytics.com / AdAnalytics2024!Analyst
echo - viewer@adanalytics.com / AdAnalytics2024!Viewer
echo.
echo ⏳ Please wait for both servers to fully start before trying to login.
echo.
pause
