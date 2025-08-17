#!/usr/bin/env python3
"""
Phase 2.2 2단계: AI 마이크로서비스 시작 스크립트
서버 실행과 초기 설정을 자동화합니다.
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_python_version():
    """Python 버전 확인"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 이상이 필요합니다.")
        print(f"현재 버전: {sys.version}")
        return False
    print(f"✅ Python 버전 확인: {sys.version}")
    return True

def install_requirements():
    """필요한 패키지 설치"""
    print("📦 필요한 패키지를 설치합니다...")
    
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True)
        print("✅ 패키지 설치 완료")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 패키지 설치 실패: {e}")
        return False

def check_openai_api_key():
    """OpenAI API 키 확인"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your-openai-api-key":
        print("⚠️  OpenAI API 키가 설정되지 않았습니다.")
        print("환경 변수 OPENAI_API_KEY를 설정하거나 .env 파일을 생성하세요.")
        
        # .env 파일 생성 안내
        env_content = """# OpenAI API 키 설정
OPENAI_API_KEY=your-actual-openai-api-key-here

# 서버 설정
HOST=0.0.0.0
PORT=8000
DEBUG=true
"""
        
        env_file = Path(".env")
        if not env_file.exists():
            with open(env_file, "w", encoding="utf-8") as f:
                f.write(env_content)
            print("📝 .env 파일이 생성되었습니다. API 키를 설정하세요.")
        
        return False
    
    print("✅ OpenAI API 키 확인 완료")
    return True

def create_directories():
    """필요한 디렉토리 생성"""
    directories = ["chroma_db", "logs"]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    print("✅ 필요한 디렉토리 생성 완료")

def start_server():
    """서버 시작"""
    print("🚀 AI 마이크로서비스를 시작합니다...")
    print("📍 서버 주소: http://localhost:8000")
    print("📚 API 문서: http://localhost:8000/docs")
    print("🔍 헬스 체크: http://localhost:8000/health")
    print("📊 통계 정보: http://localhost:8000/stats")
    print("🧪 테스트: http://localhost:8000/test")
    print("\n" + "="*50)
    print("서버를 중지하려면 Ctrl+C를 누르세요.")
    print("="*50 + "\n")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "api_server:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload",
            "--log-level", "info"
        ])
    except KeyboardInterrupt:
        print("\n🛑 서버가 중지되었습니다.")
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")

def main():
    """메인 함수"""
    print("🎯 Phase 2.2: 파라미터 + 템플릿 추천 시스템")
    print("="*50)
    
    # 1. Python 버전 확인
    if not check_python_version():
        return
    
    # 2. 디렉토리 생성
    create_directories()
    
    # 3. 패키지 설치
    if not install_requirements():
        return
    
    # 4. API 키 확인
    if not check_openai_api_key():
        print("\n⚠️  API 키 없이도 서버는 시작되지만, 추천 기능이 제한될 수 있습니다.")
        response = input("계속 진행하시겠습니까? (y/N): ")
        if response.lower() != 'y':
            return
    
    # 5. 서버 시작
    start_server()

if __name__ == "__main__":
    main()
