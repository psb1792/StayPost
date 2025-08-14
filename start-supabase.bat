@echo off
echo Starting Supabase script...
echo Current directory: %CD%
echo.

echo Step 1: Testing basic commands...
echo Hello World
echo.

echo Step 2: Testing Docker...
docker --version
echo Docker test completed
echo.

echo Step 3: Testing Supabase CLI...
supabase --version
echo Supabase test completed
echo.

echo Step 4: Starting Supabase...
supabase start
echo.

echo Step 5: Script completed
echo.
echo Press any key to continue...
pause 