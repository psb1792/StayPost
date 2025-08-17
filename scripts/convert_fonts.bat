@echo off
chcp 65001 >nul
echo 🎨 StayPost 폰트 변환기 (Windows)
echo ========================================

REM Python 설치 확인
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python이 설치되지 않았습니다.
    echo https://python.org 에서 Python을 설치해주세요.
    pause
    exit /b 1
)

echo ✅ Python 설치됨

REM 필요한 패키지 설치
echo 🔄 필요한 패키지 설치 중...
pip install fonttools brotli

REM 폰트 변환 실행
echo.
echo �� 폰트 변환 시작...
python font_converter.py

echo.
echo 📋 변환 완료!
echo 📁 변환된 파일: public/fonts/woff2/
pause
