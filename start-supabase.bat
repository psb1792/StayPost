@echo off
echo 🔧 Cleaning up Supabase containers...

REM Check and remove supabase_vector_StayPost container if it exists
docker ps -a --format "table {{.Names}}" | findstr "supabase_vector_StayPost" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Found conflicting container: supabase_vector_StayPost
    echo 🗑️  Removing container...
    docker rm -f supabase_vector_StayPost
    echo ✅ Container removed successfully
) else (
    echo ✅ No conflicting containers found
)

echo 🚀 Starting Supabase...
supabase start

echo ✅ Supabase started successfully!
pause 