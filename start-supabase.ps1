Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Supabase Clean Start Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Checking Docker status..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running or not installed!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔍 Checking Supabase CLI..." -ForegroundColor Yellow
try {
    supabase --version | Out-Null
    Write-Host "✅ Supabase CLI is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Supabase CLI and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔧 Cleaning up existing Supabase containers..." -ForegroundColor Yellow
try {
    $containers = docker ps -a --filter "name=supabase" --format "{{.Names}}" 2>$null
    if ($containers) {
        Write-Host "🗑️  Removing Supabase containers..." -ForegroundColor Yellow
        $containers | ForEach-Object {
            if ($_ -match "supabase") {
                Write-Host "Removing: $_" -ForegroundColor Yellow
                docker rm -f $_ 2>$null
            }
        }
    } else {
        Write-Host "✅ No existing Supabase containers found" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not clean up containers (this is usually OK)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting Supabase..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

try {
    supabase start
    Write-Host ""
    Write-Host "✅ Supabase started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Dashboard: http://localhost:54323" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ Failed to start Supabase!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to close" 