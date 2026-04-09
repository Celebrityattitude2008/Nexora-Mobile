# Build script for Capacitor - temporarily removes API routes
Write-Host "Building Nexora for Capacitor..." -ForegroundColor Green

# Move API folder temporarily
if (Test-Path "app/api") {
  Write-Host "Temporarily hiding API routes..." -ForegroundColor Cyan
  Move-Item -Path "app/api" -Destination "app/api.bak" -Force
}

# Build
Write-Host "Running Next.js build with static export..." -ForegroundColor Cyan
npm run build

# Restore API folder
if (Test-Path "app/api.bak") {
  Write-Host "Restoring API routes..." -ForegroundColor Cyan
  Move-Item -Path "app/api.bak" -Destination "app/api" -Force
}

Write-Host "Build complete! Output in 'out' folder." -ForegroundColor Green
