#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * JSON 파일을 압축하는 도구
 * 사용법: node scripts/minify-json.js <input.json> [output.json]
 */

function minifyJson(inputPath, outputPath) {
  try {
    console.log(`📖 JSON 파일 읽는 중: ${inputPath}`);
    
    // 파일 크기 확인
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    // JSON 파일 읽기
    const jsonContent = fs.readFileSync(inputPath, 'utf8');
    const parsed = JSON.parse(jsonContent);
    
    // 압축된 JSON 생성
    const minified = JSON.stringify(parsed);
    
    // 출력 파일 경로 설정
    const finalOutputPath = outputPath || inputPath.replace('.json', '.min.json');
    
    // 압축된 파일 저장
    fs.writeFileSync(finalOutputPath, minified);
    
    // 압축된 파일 크기 확인
    const compressedStats = fs.statSync(finalOutputPath);
    const compressedSize = compressedStats.size;
    
    // 결과 출력
    console.log(`✅ JSON 압축 완료!`);
    console.log(`📁 원본 파일: ${inputPath}`);
    console.log(`📁 압축 파일: ${finalOutputPath}`);
    console.log(`📊 크기 변화: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)}`);
    console.log(`📈 압축률: ${((1 - compressedSize / originalSize) * 100).toFixed(2)}%`);
    
    return {
      originalSize,
      compressedSize,
      compressionRatio: (1 - compressedSize / originalSize) * 100
    };
    
  } catch (error) {
    console.error('❌ JSON 압축 실패:', error.message);
    process.exit(1);
  }
}

/**
 * 바이트를 읽기 쉬운 형태로 변환
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 특정 필드만 추출하여 압축
 */
function extractAndMinify(inputPath, outputPath, fields) {
  try {
    console.log(`�� JSON 파일에서 특정 필드 추출 중: ${inputPath}`);
    
    const jsonContent = fs.readFileSync(inputPath, 'utf8');
    const parsed = JSON.parse(jsonContent);
    
    // 지정된 필드만 추출
    const extracted = {};
    fields.forEach(field => {
      if (parsed.hasOwnProperty(field)) {
        extracted[field] = parsed[field];
      }
    });
    
    // 압축된 JSON 생성
    const minified = JSON.stringify(extracted);
    
    // 출력 파일 저장
    const finalOutputPath = outputPath || inputPath.replace('.json', '.extracted.min.json');
    fs.writeFileSync(finalOutputPath, minified);
    
    console.log(`✅ 필드 추출 및 압축 완료!`);
    console.log(`📁 추출된 필드: ${fields.join(', ')}`);
    console.log(`📁 출력 파일: ${finalOutputPath}`);
    
    return extracted;
    
  } catch (error) {
    console.error('❌ 필드 추출 실패:', error.message);
    process.exit(1);
  }
}

/**
 * 디렉토리 내 모든 JSON 파일 압축
 */
function minifyAllJsonInDirectory(directoryPath) {
  try {
    console.log(`�� 디렉토리 내 JSON 파일 압축: ${directoryPath}`);
    
    const files = fs.readdirSync(directoryPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('❌ JSON 파일을 찾을 수 없습니다.');
      return;
    }
    
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    jsonFiles.forEach(file => {
      const filePath = path.join(directoryPath, file);
      const result = minifyJson(filePath);
      totalOriginalSize += result.originalSize;
      totalCompressedSize += result.compressedSize;
    });
    
    console.log(`\n📊 전체 압축 결과:`);
    console.log(`📈 총 압축률: ${((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(2)}%`);
    
  } catch (error) {
    console.error('❌ 디렉토리 압축 실패:', error.message);
    process.exit(1);
  }
}

// CLI 실행
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
�� JSON 압축 도구

사용법:
  node scripts/minify-json.js <input.json> [output.json]
  node scripts/minify-json.js --dir <directory>
  node scripts/minify-json.js --extract <input.json> <field1,field2,...> [output.json]

예시:
  node scripts/minify-json.js data/large-file.json
  node scripts/minify-json.js data/large-file.json compressed.json
  node scripts/minify-json.js --dir data/ai-training/
  node scripts/minify-json.js --extract data/large-file.json timestamp,imageUrl compressed.json
`);
  process.exit(0);
}

if (args[0] === '--dir') {
  if (args.length < 2) {
    console.error('❌ 디렉토리 경로를 지정해주세요.');
    process.exit(1);
  }
  minifyAllJsonInDirectory(args[1]);
} else if (args[0] === '--extract') {
  if (args.length < 3) {
    console.error('❌ 파일 경로와 추출할 필드를 지정해주세요.');
    process.exit(1);
  }
  const inputPath = args[1];
  const fields = args[2].split(',');
  const outputPath = args[3];
  extractAndMinify(inputPath, outputPath, fields);
} else {
  const inputPath = args[0];
  const outputPath = args[1];
  minifyJson(inputPath, outputPath);
}
