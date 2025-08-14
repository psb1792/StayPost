# Supabase container cleanup script before starting
Write-Host "🔧 Cleaning up Supabase containers..." -ForegroundColor Yellow

# Check and remove supabase_vector_StayPost container if it exists
$containerName = "supabase_vector_StayPost"
$containerExists = docker ps -a --format "table {{.Names}}" | Select-String $containerName

if ($containerExists) {
    Write-Host "⚠️  Found conflicting container: $containerName" -ForegroundColor Red
    Write-Host "🗑️  Removing container..." -ForegroundColor Yellow
    docker rm -f $containerName
    Write-Host "✅ Container removed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ No conflicting containers found" -ForegroundColor Green
}

# Check other supabase related containers
$supabaseContainers = docker ps -a --format "table {{.Names}}" | Select-String "supabase_"
if ($supabaseContainers) {
    Write-Host "🔍 Other Supabase containers:" -ForegroundColor Cyan
    Write-Host $supabaseContainers
}

Write-Host "🚀 Starting Supabase..." -ForegroundColor Green
supabase start

Write-Host "✅ Supabase started successfully!" -ForegroundColor Green 