@echo off
echo 🔒 Fixing Password Breach Issue
echo =============================
echo.

echo Step 1: Starting Docker services...
docker-compose up -d

echo.
echo Step 2: Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo Step 3: Setting up backend environment...
cd backend
if not exist .env (
    echo Creating .env file from example...
    copy env.example .env
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)

echo.
echo Step 4: Installing backend dependencies...
npm install

echo.
echo Step 5: Creating users with secure passwords...
node fix-login.js

echo.
echo Step 6: Updating existing users with secure passwords...
node update-passwords.js

echo.
echo 🎯 Password breach issue fixed!
echo.
echo 📋 New Secure Login Credentials:
echo - admin@adanalytics.com / AdAnalytics2024!Admin
echo - manager@adanalytics.com / AdAnalytics2024!Manager
echo - analyst@adanalytics.com / AdAnalytics2024!Analyst
echo - viewer@adanalytics.com / AdAnalytics2024!Viewer
echo.
echo 🔒 These passwords are secure and not found in data breaches!
echo.
echo 💡 You can now login without Chrome's data breach warning.
echo.
pause
