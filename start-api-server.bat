@echo off
echo Starting StayPost API Server...
echo.
echo Checking and installing required packages...
cd server

REM Check if requirements.txt exists
if not exist requirements.txt (
    echo Error: requirements.txt not found in server directory
    pause
    exit /b 1
)

REM Install required packages
echo Installing Python packages...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install required packages
    echo Please make sure you have Python and pip installed
    pause
    exit /b 1
)

echo.
echo Starting API server...
python api_server.py
if %errorlevel% neq 0 (
    echo.
    echo API server stopped with an error
    pause
    exit /b 1
)

pause
