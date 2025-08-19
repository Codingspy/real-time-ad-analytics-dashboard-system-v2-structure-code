Write-Host "🔒 Updating Elasticsearch Password for Security" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Stopping existing Docker services..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "Step 2: Updating .env file with secure password..." -ForegroundColor Yellow
Set-Location backend

if (Test-Path ".env") {
    Write-Host "Updating existing .env file..." -ForegroundColor Cyan
    $content = Get-Content .env
    $content = $content -replace 'ELASTICSEARCH_PASSWORD=.*', 'ELASTICSEARCH_PASSWORD=AdAnalytics2024!Secure'
    Set-Content .env $content
    Write-Host "✅ .env file updated" -ForegroundColor Green
} else {
    Write-Host "Creating new .env file from example..." -ForegroundColor Cyan
    Copy-Item env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Starting services with new secure password..." -ForegroundColor Yellow
Set-Location ..
docker-compose up -d

Write-Host ""
Write-Host "Step 4: Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host ""
Write-Host "Step 5: Testing new password..." -ForegroundColor Yellow
Set-Location backend
node simple-elasticsearch-test.js

Write-Host ""
Write-Host "🎯 Password update completed!" -ForegroundColor Green
Write-Host "New secure password: AdAnalytics2024!Secure" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Please save this password securely and don't share it." -ForegroundColor Yellow

Read-Host "Press Enter to continue"
