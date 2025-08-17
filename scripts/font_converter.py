#!/usr/bin/env python3
"""
Font Converter: TTF/OTF to WOFF2
StayPost 프로젝트용 폰트 변환 도구

사용법:
    python scripts/font_converter.py
    python scripts/font_converter.py --input-dir public/fonts --output-dir public/fonts/woff2
    python scripts/font_converter.py --single Cafe24PROUP.ttf
"""

import os
import sys
import argparse
import subprocess
import glob
from pathlib import Path
from typing import List, Optional

class FontConverter:
    def __init__(self, input_dir: str = "public/fonts", output_dir: str = "public/fonts/woff2"):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.supported_formats = ['.ttf', '.otf']
        
        # 출력 디렉토리 생성
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def check_dependencies(self) -> bool:
        """필요한 도구들이 설치되어 있는지 확인"""
        tools = {
            'woff2': 'Google WOFF2 Tools',
            'fonttools': 'FontTools Python library'
        }
        
        missing_tools = []
        woff2_available = False
        
        # woff2 도구 확인
        try:
            result = subprocess.run(['woff2_compress', '--version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                woff2_available = True
                print("✅ Google WOFF2 Tools 설치됨")
            else:
                missing_tools.append('woff2')
        except FileNotFoundError:
            missing_tools.append('woff2')
        
        # fonttools 확인
        try:
            import fontTools
            print(f"✅ FontTools {fontTools.__version__} 설치됨")
        except ImportError:
            missing_tools.append('fonttools')
        
        if missing_tools:
            print("⚠️  다음 도구들이 설치되지 않았습니다:")
            for tool in missing_tools:
                print(f"   - {tools.get(tool, tool)}")
            
            if 'fonttools' in missing_tools:
                print("\n설치 방법:")
                print("1. FontTools:")
                print("   pip install fonttools")
                return False
            else:
                print("\n⚠️  WOFF2 Tools가 없지만 FontTools로 변환을 계속합니다.")
                print("   (압축률이 조금 낮을 수 있습니다)")
        
        return True
    
    def get_font_files(self, single_file: Optional[str] = None) -> List[Path]:
        """변환할 폰트 파일 목록 가져오기"""
        if single_file:
            file_path = self.input_dir / single_file
            if file_path.exists() and file_path.suffix.lower() in self.supported_formats:
                return [file_path]
            else:
                print(f"❌ 파일을 찾을 수 없거나 지원하지 않는 형식: {single_file}")
                return []
        
        font_files = set()  # 중복 제거를 위해 set 사용
        for format_ext in self.supported_formats:
            # 소문자 확장자만 사용하여 중복 방지
            font_files.update(self.input_dir.glob(f"*{format_ext.lower()}"))
        
        return sorted(list(font_files))
    
    def convert_with_woff2(self, input_file: Path) -> bool:
        """woff2_compress를 사용한 변환 (가장 효율적)"""
        output_file = self.output_dir / f"{input_file.stem}.woff2"
        
        try:
            cmd = ['woff2_compress', str(input_file)]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                # woff2_compress는 입력 파일과 같은 디렉토리에 출력
                temp_output = input_file.parent / f"{input_file.stem}.woff2"
                if temp_output.exists():
                    temp_output.rename(output_file)
                    print(f"✅ {input_file.name} → {output_file.name}")
                    return True
                else:
                    print(f"❌ 변환 실패: 출력 파일이 생성되지 않음 - {input_file.name}")
                    return False
            else:
                print(f"❌ 변환 실패: {input_file.name}")
                print(f"   오류: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ 변환 중 오류 발생: {input_file.name} - {e}")
            return False
    
    def convert_with_fonttools(self, input_file: Path) -> bool:
        """FontTools를 사용한 변환 (폴백 방법)"""
        output_file = self.output_dir / f"{input_file.stem}.woff2"
        
        try:
            from fontTools.ttLib import TTFont
            from fontTools.ttLib.woff2 import compress
            
            # 폰트 로드
            font = TTFont(str(input_file))
            
            # WOFF2로 압축 - 파일 경로를 직접 전달
            compress(str(input_file), str(output_file))
            
            print(f"✅ {input_file.name} → {output_file.name} (FontTools)")
            return True
            
        except Exception as e:
            print(f"❌ FontTools 변환 실패: {input_file.name} - {e}")
            return False
    
    def convert_font(self, input_file: Path) -> bool:
        """단일 폰트 변환"""
        print(f"🔄 변환 중: {input_file.name}")
        
        # 파일 크기 정보
        file_size = input_file.stat().st_size / 1024  # KB
        print(f"   📁 크기: {file_size:.1f} KB")
        
        # woff2_compress 사용 가능한지 확인
        try:
            result = subprocess.run(['woff2_compress', '--version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                # woff2_compress 우선 시도
                if self.convert_with_woff2(input_file):
                    # 변환 후 크기 비교
                    output_file = self.output_dir / f"{input_file.stem}.woff2"
                    if output_file.exists():
                        output_size = output_file.stat().st_size / 1024  # KB
                        compression_ratio = (1 - output_size / file_size) * 100
                        print(f"   📊 압축률: {compression_ratio:.1f}% ({file_size:.1f}KB → {output_size:.1f}KB)")
                    return True
        except FileNotFoundError:
            pass
        
        # 폴백: FontTools 사용
        print(f"   🔄 WOFF2 Tools 없음, FontTools로 변환...")
        return self.convert_with_fonttools(input_file)
    
    def convert_all(self, single_file: Optional[str] = None) -> None:
        """모든 폰트 변환"""
        print("🎨 StayPost 폰트 변환기 시작")
        print(f"📂 입력 디렉토리: {self.input_dir}")
        print(f"📂 출력 디렉토리: {self.output_dir}")
        print()
        
        # 의존성 확인
        if not self.check_dependencies():
            sys.exit(1)
        
        # 폰트 파일 목록
        font_files = self.get_font_files(single_file)
        
        if not font_files:
            print("❌ 변환할 폰트 파일을 찾을 수 없습니다.")
            print(f"   지원 형식: {', '.join(self.supported_formats)}")
            print(f"   검색 경로: {self.input_dir}")
            return
        
        print(f"📋 변환할 폰트 {len(font_files)}개 발견:")
        for font_file in font_files:
            print(f"   - {font_file.name}")
        print()
        
        # 변환 실행
        success_count = 0
        total_count = len(font_files)
        
        for font_file in font_files:
            if self.convert_font(font_file):
                success_count += 1
            print()
        
        # 결과 요약
        print("📊 변환 완료!")
        print(f"✅ 성공: {success_count}/{total_count}")
        print(f"❌ 실패: {total_count - success_count}/{total_count}")
        
        if success_count > 0:
            print(f"\n📁 변환된 파일 위치: {self.output_dir}")
            print("\n💡 사용 팁:")
            print("   - WOFF2는 TTF/OTF보다 30-50% 작습니다")
            print("   - 모든 모던 브라우저에서 지원됩니다")
            print("   - CSS에서 @font-face로 사용하세요")

def main():
    parser = argparse.ArgumentParser(description="TTF/OTF 폰트를 WOFF2로 변환")
    parser.add_argument("--input-dir", default="public/fonts", 
                       help="입력 폰트 디렉토리 (기본값: public/fonts)")
    parser.add_argument("--output-dir", default="public/fonts/woff2",
                       help="출력 디렉토리 (기본값: public/fonts/woff2)")
    parser.add_argument("--single", help="단일 파일 변환 (예: Cafe24PROUP.ttf)")
    
    args = parser.parse_args()
    
    converter = FontConverter(args.input_dir, args.output_dir)
    converter.convert_all(args.single)

if __name__ == "__main__":
    main()


