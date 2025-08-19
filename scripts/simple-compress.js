#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 간단한 이미지 압축 도구 (canvas 없이)
 * 사용법: node scripts/simple-compress.js <input.json> [output.json]
 */

function compressBase64Simple(base64Data, quality = 0.8) {
  try {
    // base64 데이터 파싱
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) {
      return base64Data; // base64가 아니면 원본 반환
    }
    
    const mimeType = matches[1];
    const base64String = matches[2];
    
    // 이미지 타입이 JPEG/PNG가 아니면 원본 반환
    if (!mimeType.includes('jpeg') && !mimeType.includes('png')) {
      return base64Data;
    }
    
    // base64 디코딩
    const buffer = Buffer.from(base64String, 'base64');
    
    // 간단한 압축: 버퍼 크기 줄이기
    const compressedBuffer = buffer.slice(0, Math.floor(buffer.length * quality));
    
    // 다시 base64로 인코딩
    const compressedBase64 = compressedBuffer.toString('base64');
    
    return `data:${mimeType};base64,${compressedBase64}`;
  } catch (error) {
    console.error('이미지 압축 중 오류:', error.message);
    return base64Data; // 압축 실패시 원본 반환
  }
}

function removeImageData(inputPath, outputPath) {
  try {
    console.log(`📖 JSON 파일 읽는 중: ${inputPath}`);
    
    // 파일 크기 확인
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    // JSON 파일 읽기
    const jsonContent = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(jsonContent);
    
    console.log(`🔍 이미지 데이터 제거 중...`);
    
    // 재귀적으로 base64 이미지 제거
    function removeImagesInObject(obj) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.startsWith('data:image')) {
          console.log(`🗑️  이미지 데이터 제거: ${key}`);
          obj[key] = '[IMAGE_DATA_REMOVED]'; // 이미지 데이터 제거
        } else if (typeof value === 'object' && value !== null) {
          removeImagesInObject(value);
        }
      }
    }
    
    removeImagesInObject(data);
    
    // 최적화된 JSON 생성
    const optimizedJson = JSON.stringify(data, null, 2);
    
    // 출력 파일 경로 설정
    const finalOutputPath = outputPath || inputPath.replace('.json', '.no-images.json');
    
    // 최적화된 파일 저장
    fs.writeFileSync(finalOutputPath, optimizedJson);
    
    // 결과 확인
    const optimizedStats = fs.statSync(finalOutputPath);
    const optimizedSize = optimizedStats.size;
    const reductionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log(`✅ 최적화 완료!`);
    console.log(`📊 원본 크기: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📊 최적화 크기: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📊 크기 감소: ${reductionRatio}%`);
    console.log(`💾 저장 위치: ${finalOutputPath}`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

function extractImageMetadata(inputPath, outputPath) {
  try {
    console.log(`📖 JSON 파일 읽는 중: ${inputPath}`);
    
    // JSON 파일 읽기
    const jsonContent = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(jsonContent);
    
    console.log(`🔍 이미지 메타데이터 추출 중...`);
    
    // 이미지 메타데이터만 추출
    const metadata = {
      timestamp: data.timestamp,
      analysis: data.analysis || {},
      metadata: {
        originalFile: path.basename(inputPath),
        processedAt: new Date().toISOString(),
        imageCount: 0,
        imageTypes: []
      }
    };
    
    // 재귀적으로 이미지 정보 수집
    function collectImageInfo(obj, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.startsWith('data:image')) {
          metadata.metadata.imageCount++;
          
          // 이미지 타입 추출
          const mimeType = value.match(/^data:([^;]+);/)?.[1];
          if (mimeType && !metadata.metadata.imageTypes.includes(mimeType)) {
            metadata.metadata.imageTypes.push(mimeType);
          }
          
          // 이미지 크기 추출 (base64 길이로 추정)
          const base64Length = value.length;
          const estimatedSizeKB = Math.floor(base64Length * 0.75 / 1024);
          
          if (!metadata.metadata.estimatedTotalSize) {
            metadata.metadata.estimatedTotalSize = 0;
          }
          metadata.metadata.estimatedTotalSize += estimatedSizeKB;
          
          console.log(`📸 이미지 발견: ${path}.${key} (${mimeType}, ~${estimatedSizeKB}KB)`);
        } else if (typeof value === 'object' && value !== null) {
          collectImageInfo(value, path ? `${path}.${key}` : key);
        }
      }
    }
    
    collectImageInfo(data);
    
    // 메타데이터 파일 저장
    const finalOutputPath = outputPath || inputPath.replace('.json', '.metadata.json');
    fs.writeFileSync(finalOutputPath, JSON.stringify(metadata, null, 2));
    
    console.log(`✅ 메타데이터 추출 완료!`);
    console.log(`📊 총 이미지 수: ${metadata.metadata.imageCount}`);
    console.log(`📊 이미지 타입: ${metadata.metadata.imageTypes.join(', ')}`);
    console.log(`📊 예상 총 크기: ${(metadata.metadata.estimatedTotalSize / 1024).toFixed(2)} MB`);
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
🖼️  간단한 이미지 최적화 도구

사용법:
  node scripts/simple-compress.js <input.json> [output.json] [mode]

옵션:
  input.json    처리할 JSON 파일 경로
  output.json   출력 파일 경로 (선택사항)
  mode          처리 모드 (remove/metadata, 기본값: remove)

모드:
  remove        이미지 데이터를 제거하고 메타데이터만 유지
  metadata      이미지 메타데이터만 추출

예시:
  node scripts/simple-compress.js data/ai-training/style-extractions/design-intents/2025-08-17_18-39-22_style-extraction.json
  node scripts/simple-compress.js input.json output.json remove
  node scripts/simple-compress.js input.json metadata.json metadata
  `);
  process.exit(0);
}

const inputPath = args[0];
const outputPath = args[1];
const mode = args[2] || 'remove';

// 입력 파일 존재 확인
if (!fs.existsSync(inputPath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${inputPath}`);
  process.exit(1);
}

// 모드에 따른 처리
if (mode === 'metadata') {
  extractImageMetadata(inputPath, outputPath);
} else {
  removeImageData(inputPath, outputPath);
}
