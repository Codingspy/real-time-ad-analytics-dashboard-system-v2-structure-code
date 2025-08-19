@echo off
echo Starting Ad Analytics Backend...
echo.

echo 1. Creating users in database...
cd backend
node fix-login.js

echo.
echo 2. Starting backend server...
npm run dev

pause
