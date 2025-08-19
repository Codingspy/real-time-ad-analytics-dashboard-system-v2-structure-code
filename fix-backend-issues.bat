@echo off
echo 🔧 Fixing Backend Issues
echo =======================
echo.

echo Step 1: Starting Docker services...
docker-compose up -d

echo.
echo Step 2: Waiting for services to be ready...
timeout /t 20 /nobreak >nul

echo.
echo Step 3: Setting up backend environment...
cd backend

echo.
echo Step 4: Creating .env file if it doesn't exist...
if not exist .env (
    echo Creating .env file from example...
    copy env.example .env
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)

echo.
echo Step 5: Installing dependencies...
npm install

echo.
echo Step 6: Setting up environment and checking status...
node setup-env.js

echo.
echo Step 7: Creating users with secure passwords...
node fix-login.js

echo.
echo Step 8: Testing backend functionality...
node check-backend-status.js

echo.
echo Step 9: Starting backend server...
echo 🚀 Backend server starting...
echo 📧 Email functionality: Development mode (logs to console)
echo 🔐 Login: admin@adanalytics.com / AdAnalytics2024!Admin
echo.
echo Press Ctrl+C to stop the server
echo.
npm run dev
