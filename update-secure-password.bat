@echo off
echo 🔒 Updating Elasticsearch Password for Security
echo ==============================================
echo.

echo Step 1: Stopping existing Docker services...
docker-compose down

echo.
echo Step 2: Updating .env file with secure password...
cd backend
if exist .env (
    echo Updating existing .env file...
    powershell -Command "(Get-Content .env) -replace 'ELASTICSEARCH_PASSWORD=.*', 'ELASTICSEARCH_PASSWORD=AdAnalytics2024!Secure' | Set-Content .env"
    echo ✅ .env file updated
) else (
    echo Creating new .env file from example...
    copy env.example .env
    echo ✅ .env file created
)

echo.
echo Step 3: Starting services with new secure password...
cd ..
docker-compose up -d

echo.
echo Step 4: Waiting for services to be ready...
timeout /t 20 /nobreak >nul

echo.
echo Step 5: Testing new password...
cd backend
node simple-elasticsearch-test.js

echo.
echo 🎯 Password update completed!
echo New secure password: AdAnalytics2024!Secure
echo.
echo 💡 Please save this password securely and don't share it.
pause
