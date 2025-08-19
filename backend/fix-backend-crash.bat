@echo off
echo 🔧 Fixing Backend Crash Issues...
echo.

echo Step 1: Checking if .env file exists...
if not exist .env (
    echo ❌ .env file missing - creating it...
    copy env.example .env
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)

echo.
echo Step 2: Installing dependencies...
npm install

echo.
echo Step 3: Creating users in database...
node fix-login.js

echo.
echo Step 4: Testing backend startup...
node debug-backend.js

echo.
echo Step 5: Starting backend server...
echo If the server crashes, check the error messages above.
npm run dev

pause
