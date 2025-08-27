#!/usr/bin/env python3
"""
이미지 압축 스크립트
data/image 폴더의 이미지들을 1/4 크기로 압축합니다.
"""

import os
import sys
from pathlib import Path
from PIL import Image
import argparse
from typing import List, Tuple

def get_file_size_mb(file_path: str) -> float:
    """파일 크기를 MB 단위로 반환"""
    return os.path.getsize(file_path) / (1024 * 1024)

def compress_image(input_path: str, output_path: str, quality: int = 85, max_width: int = 1920, max_height: int = 1080) -> Tuple[bool, float, float]:
    """
    이미지를 압축합니다.
    
    Args:
        input_path: 입력 이미지 경로
        output_path: 출력 이미지 경로
        quality: JPEG 품질 (1-100)
        max_width: 최대 너비
        max_height: 최대 높이
    
    Returns:
        (성공여부, 원본크기_MB, 압축후크기_MB)
    """
    try:
        # 원본 파일 크기
        original_size = get_file_size_mb(input_path)
        
        # 이미지 열기
        with Image.open(input_path) as img:
            # RGB로 변환 (RGBA 등 처리)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # 원본 크기
            original_width, original_height = img.size
            
            # 비율 유지하면서 리사이즈
            if original_width > max_width or original_height > max_height:
                ratio = min(max_width / original_width, max_height / original_height)
                new_width = int(original_width * ratio)
                new_height = int(original_height * ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # 압축된 이미지 저장
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
        
        # 압축 후 파일 크기
        compressed_size = get_file_size_mb(output_path)
        
        return True, original_size, compressed_size
        
    except Exception as e:
        print(f"❌ {input_path} 압축 실패: {e}")
        return False, 0, 0

def compress_images_in_folder(input_folder: str, output_folder: str = None, quality: int = 85, 
                            max_width: int = 1920, max_height: int = 1080, backup: bool = True) -> None:
    """
    폴더 내의 모든 이미지를 압축합니다.
    
    Args:
        input_folder: 입력 폴더 경로
        output_folder: 출력 폴더 경로 (None이면 원본 폴더에 저장)
        quality: JPEG 품질
        max_width: 최대 너비
        max_height: 최대 높이
        backup: 원본 파일 백업 여부
    """
    input_path = Path(input_folder)
    
    if not input_path.exists():
        print(f"❌ 입력 폴더가 존재하지 않습니다: {input_folder}")
        return
    
    # 출력 폴더 설정
    if output_folder is None:
        output_path = input_path
    else:
        output_path = Path(output_folder)
        output_path.mkdir(parents=True, exist_ok=True)
    
    # 지원하는 이미지 확장자
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    
    # 이미지 파일 찾기
    image_files = []
    for ext in image_extensions:
        image_files.extend(input_path.glob(f'*{ext}'))
        image_files.extend(input_path.glob(f'*{ext.upper()}'))
    
    if not image_files:
        print(f"❌ {input_folder}에서 이미지 파일을 찾을 수 없습니다.")
        return
    
    print(f"📁 {len(image_files)}개의 이미지 파일을 찾았습니다.")
    print(f"🎯 압축 설정: 품질={quality}, 최대크기={max_width}x{max_height}")
    print("-" * 60)
    
    # 백업 폴더 생성
    if backup and output_folder is None:
        backup_folder = input_path / "original_backup"
        backup_folder.mkdir(exist_ok=True)
        print(f"📦 원본 파일 백업: {backup_folder}")
    
    total_original_size = 0
    total_compressed_size = 0
    success_count = 0
    
    for image_file in sorted(image_files):
        print(f"🔄 처리 중: {image_file.name}")
        
        # 출력 파일 경로
        if output_folder is None:
            output_file = image_file
            # 백업
            if backup:
                backup_file = backup_folder / image_file.name
                if not backup_file.exists():
                    import shutil
                    shutil.copy2(image_file, backup_file)
        else:
            output_file = output_path / image_file.name
        
        # 압축
        success, original_size, compressed_size = compress_image(
            str(image_file), 
            str(output_file), 
            quality, 
            max_width, 
            max_height
        )
        
        if success:
            total_original_size += original_size
            total_compressed_size += compressed_size
            success_count += 1
            
            compression_ratio = (1 - compressed_size / original_size) * 100
            print(f"✅ {image_file.name}: {original_size:.2f}MB → {compressed_size:.2f}MB ({compression_ratio:.1f}% 감소)")
        else:
            print(f"❌ {image_file.name}: 압축 실패")
    
    print("-" * 60)
    print(f"📊 압축 완료: {success_count}/{len(image_files)}개 성공")
    print(f"💾 전체 크기: {total_original_size:.2f}MB → {total_compressed_size:.2f}MB")
    
    if total_original_size > 0:
        total_compression_ratio = (1 - total_compressed_size / total_original_size) * 100
        print(f"📈 전체 압축률: {total_compression_ratio:.1f}%")
        print(f"🎯 목표 압축률: 75% (1/4 크기)")

def main():
    parser = argparse.ArgumentParser(description='이미지 압축 스크립트')
    parser.add_argument('--input', '-i', default='data/image', 
                       help='입력 폴더 경로 (기본값: data/image)')
    parser.add_argument('--output', '-o', default=None,
                       help='출력 폴더 경로 (기본값: 원본 폴더)')
    parser.add_argument('--quality', '-q', type=int, default=85,
                       help='JPEG 품질 (1-100, 기본값: 85)')
    parser.add_argument('--max-width', type=int, default=1920,
                       help='최대 너비 (기본값: 1920)')
    parser.add_argument('--max-height', type=int, default=1080,
                       help='최대 높이 (기본값: 1080)')
    parser.add_argument('--no-backup', action='store_true',
                       help='원본 파일 백업하지 않음')
    
    args = parser.parse_args()
    
    print("🖼️  이미지 압축 스크립트 시작")
    print(f"📁 입력 폴더: {args.input}")
    print(f"📁 출력 폴더: {args.output or '원본 폴더'}")
    
    compress_images_in_folder(
        args.input,
        args.output,
        args.quality,
        args.max_width,
        args.max_height,
        not args.no_backup
    )

if __name__ == "__main__":
    main()
