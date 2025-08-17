#!/usr/bin/env python3
"""
Font Tools Installer
StayPost 프로젝트용 폰트 변환 도구 설치 스크립트

사용법:
    python scripts/install_font_tools.py
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(cmd, description):
    """명령어 실행 및 결과 출력"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} 완료")
            if result.stdout.strip():
                print(f"   출력: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {description} 실패")
            if result.stderr.strip():
                print(f"   오류: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ {description} 중 오류 발생: {e}")
        return False

def install_python_packages():
    """Python 패키지 설치"""
    packages = [
        "fonttools",
        "brotli"  # WOFF2 압축에 필요
    ]
    
    print("🐍 Python 패키지 설치")
    for package in packages:
        if not run_command(f"pip install {package}", f"{package} 설치"):
            print(f"⚠️ {package} 설치 실패, 수동으로 설치해주세요:")
            print(f"   pip install {package}")

def install_woff2_tools():
    """WOFF2 도구 설치"""
    system = platform.system().lower()
    
    print("🔧 WOFF2 도구 설치")
    
    if system == "windows":
        print("📋 Windows에서 WOFF2 설치:")
        print("1. https://github.com/google/woff2/releases 에서 최신 버전 다운로드")
        print("2. 압축 해제 후 woff2_compress.exe를 PATH에 추가")
        print("3. 또는 현재 디렉토리에 복사")
        
        # Windows용 대안: FontTools만 사용
        print("\n💡 대안: FontTools만 사용하여 변환 가능")
        return True
        
    elif system == "darwin":  # macOS
        return run_command("brew install woff2", "Homebrew로 WOFF2 설치")
        
    elif system == "linux":
        # Ubuntu/Debian 계열
        if os.path.exists("/etc/debian_version"):
            return run_command("sudo apt-get update && sudo apt-get install -y woff2", 
                             "apt로 WOFF2 설치")
        # CentOS/RHEL 계열
        elif os.path.exists("/etc/redhat-release"):
            return run_command("sudo yum install -y woff2", "yum으로 WOFF2 설치")
        else:
            print("📋 Linux에서 WOFF2 설치:")
            print("1. 소스에서 빌드: https://github.com/google/woff2")
            print("2. 또는 패키지 매니저 사용")
            return False
    
    else:
        print(f"❌ 지원하지 않는 운영체제: {system}")
        return False

def verify_installation():
    """설치 확인"""
    print("\n🔍 설치 확인")
    
    # Python 패키지 확인
    try:
        import fontTools
        print(f"✅ FontTools {fontTools.__version__} 설치됨")
    except ImportError:
        print("❌ FontTools 설치되지 않음")
        return False
    
    # WOFF2 도구 확인
    try:
        result = subprocess.run(['woff2_compress', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ WOFF2 도구 설치됨")
            return True
        else:
            print("⚠️ WOFF2 도구 없음 (FontTools만 사용 가능)")
            return True
    except FileNotFoundError:
        print("⚠️ WOFF2 도구 없음 (FontTools만 사용 가능)")
        return True

def create_test_script():
    """테스트 스크립트 생성"""
    test_script = """#!/usr/bin/env python3
# 폰트 변환 테스트
import sys
from pathlib import Path

# scripts 디렉토리를 Python 경로에 추가
scripts_dir = Path(__file__).parent
sys.path.insert(0, str(scripts_dir))

try:
    from font_converter import FontConverter
    print("✅ 폰트 변환기 정상 작동")
    
    # 테스트 변환
    converter = FontConverter()
    if converter.check_dependencies():
        print("✅ 모든 의존성 확인 완료")
        print("🎉 설치 성공! 이제 폰트 변환을 사용할 수 있습니다.")
        print("\n사용법:")
        print("  python scripts/font_converter.py")
    else:
        print("❌ 의존성 문제가 있습니다.")
        
except Exception as e:
    print(f"❌ 테스트 실패: {e}")
"""
    
    test_file = Path("scripts/test_font_converter.py")
    test_file.write_text(test_script)
    print(f"✅ 테스트 스크립트 생성: {test_file}")

def main():
    print("🎨 StayPost 폰트 변환 도구 설치")
    print("=" * 50)
    
    # Python 패키지 설치
    install_python_packages()
    print()
    
    # WOFF2 도구 설치
    install_woff2_tools()
    print()
    
    # 설치 확인
    if verify_installation():
        print("\n🎉 설치 완료!")
        create_test_script()
        print("\n📋 다음 단계:")
        print("1. 테스트 실행: python scripts/test_font_converter.py")
        print("2. 폰트 변환: python scripts/font_converter.py")
        print("3. 단일 파일 변환: python scripts/font_converter.py --single Cafe24PROUP.ttf")
    else:
        print("\n❌ 설치에 문제가 있습니다.")
        print("수동으로 다음을 확인해주세요:")
        print("1. Python 3.7+ 설치")
        print("2. pip install fonttools brotli")
        print("3. WOFF2 도구 설치 (선택사항)")

if __name__ == "__main__":
    main()




