#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 이미지 압축 및 JSON 최적화 도구
 * 사용법: node scripts/compress-images.js <input.json> [output.json] [quality]
 */

// Canvas를 사용한 이미지 압축 (Node.js 환경에서)
import { createCanvas, loadImage } from 'canvas';

async function compressBase64Image(base64Data, quality = 0.8, maxWidth = 1024) {
  try {
    // base64 데이터에서 이미지 로드
    const image = await loadImage(base64Data);
    
    // 원본 크기
    const originalWidth = image.width;
    const originalHeight = image.height;
    
    // 새로운 크기 계산 (비율 유지)
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    
    if (originalWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = (originalHeight * maxWidth) / originalWidth;
    }
    
    // Canvas 생성
    const canvas = createCanvas(newWidth, newHeight);
    const ctx = canvas.getContext('2d');
    
    // 이미지 그리기
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    
    // 압축된 base64 반환
    return canvas.toDataURL('image/jpeg', quality);
  } catch (error) {
    console.error('이미지 압축 중 오류:', error.message);
    return base64Data; // 압축 실패시 원본 반환
  }
}

async function compressJsonImages(inputPath, outputPath, quality = 0.8) {
  try {
    console.log(`📖 JSON 파일 읽는 중: ${inputPath}`);
    
    // 파일 크기 확인
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    // JSON 파일 읽기
    const jsonContent = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(jsonContent);
    
    console.log(`🔍 이미지 데이터 검색 중...`);
    
    // 재귀적으로 base64 이미지 찾기
    async function compressImagesInObject(obj) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.startsWith('data:image')) {
          console.log(`🖼️  이미지 압축 중: ${key}`);
          obj[key] = await compressBase64Image(value, quality);
        } else if (typeof value === 'object' && value !== null) {
          await compressImagesInObject(value);
        }
      }
    }
    
    await compressImagesInObject(data);
    
    // 압축된 JSON 생성
    const compressedJson = JSON.stringify(data, null, 2);
    
    // 출력 파일 경로 설정
    const finalOutputPath = outputPath || inputPath.replace('.json', '.compressed.json');
    
    // 압축된 파일 저장
    fs.writeFileSync(finalOutputPath, compressedJson);
    
    // 압축 결과 확인
    const compressedStats = fs.statSync(finalOutputPath);
    const compressedSize = compressedStats.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
    
    console.log(`✅ 압축 완료!`);
    console.log(`📊 원본 크기: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📊 압축 크기: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📊 압축률: ${compressionRatio}%`);
    console.log(`💾 저장 위치: ${finalOutputPath}`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 명령행 인수 처리
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🖼️  이미지 압축 도구

사용법:
  node scripts/compress-images.js <input.json> [output.json] [quality]

옵션:
  input.json    압축할 JSON 파일 경로
  output.json   출력 파일 경로 (선택사항)
  quality       압축 품질 (0.1-1.0, 기본값: 0.8)

예시:
  node scripts/compress-images.js data/ai-training/style-extractions/design-intents/2025-08-17_18-39-22_style-extraction.json
  node scripts/compress-images.js input.json output.json 0.7
  `);
  process.exit(0);
}

const inputPath = args[0];
const outputPath = args[1];
const quality = parseFloat(args[2]) || 0.8;

// 입력 파일 존재 확인
if (!fs.existsSync(inputPath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${inputPath}`);
  process.exit(1);
}

// 품질 값 검증
if (quality < 0.1 || quality > 1.0) {
  console.error(`❌ 품질 값은 0.1에서 1.0 사이여야 합니다: ${quality}`);
  process.exit(1);
}

// 압축 실행
compressJsonImages(inputPath, outputPath, quality);
