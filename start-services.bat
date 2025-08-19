@echo off
echo Starting Ad Analytics Dashboard Services...
echo.

echo 1. Starting Docker services (MongoDB, Redis, Elasticsearch, Kibana)...
docker-compose up -d

echo.
echo 2. Waiting for services to be ready...
timeout /t 10 /nobreak > nul

echo.
echo 3. Checking service status...
docker-compose ps

echo.
echo 4. Services are ready!
echo.
echo URLs:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo - Kibana: http://localhost:5601
echo - Elasticsearch: http://localhost:9200
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Start frontend: npm run dev
echo.
pause
