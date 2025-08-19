Write-Host "Starting StayPost API Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Make sure you have Python and the required packages installed." -ForegroundColor Yellow
Write-Host ""

# 서버 디렉토리로 이동
Set-Location -Path "server"

# Python 서버 실행
try {
    python api_server.py
}
catch {
    Write-Host "Error: Failed to start the API server." -ForegroundColor Red
    Write-Host "Make sure Python is installed and the required packages are available." -ForegroundColor Yellow
    Write-Host "You can install the required packages with: pip install -r requirements.txt" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
