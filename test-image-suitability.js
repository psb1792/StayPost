const fs = require('fs');
const path = require('path');

// 테스트용 이미지 파일 경로 (실제 이미지 파일이 필요)
const testImagePath = './test-image.jpg'; // 실제 테스트 이미지 경로로 변경 필요

async function testImageSuitability() {
  try {
    // 이미지 파일이 존재하는지 확인
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ 테스트 이미지 파일이 없습니다.');
      console.log('📝 test-image.jpg 파일을 프로젝트 루트에 추가해주세요.');
      return;
    }

    // FormData 생성
    const FormData = require('form-data');
    const formData = new FormData();
    
    // 이미지 파일 추가
    const imageBuffer = fs.readFileSync(testImagePath);
    formData.append('image', imageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });

    console.log('🔄 이미지 적합성 분석 시작...');
    console.log(`📁 테스트 이미지: ${testImagePath}`);
    console.log(`📏 파일 크기: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // API 호출
    const response = await fetch('http://localhost:5001/api/image-suitability', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    console.log('\n📊 분석 결과:');
    console.log('='.repeat(50));
    
    if (!response.ok) {
      console.log('❌ 오류 발생:');
      console.log(`   상태 코드: ${response.status}`);
      console.log(`   오류 메시지: ${result.message || result.error}`);
      console.log(`   진행 가능: ${result.canProceed}`);
      return;
    }

    // 결과 출력
    console.log(`✅ 적합성 점수: ${result.suitability}%`);
    console.log(`🎯 진행 가능: ${result.canProceed ? '예' : '아니오'}`);
    
    if (result.contentType) {
      console.log(`📸 콘텐츠 타입: ${result.contentType}`);
    }
    
    if (result.rejectionReason) {
      console.log(`🚫 거부 사유: ${result.rejectionReason}`);
    }

    if (result.recommendations && result.recommendations.length > 0) {
      console.log('\n💡 권장사항:');
      result.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log('\n⚠️  주의사항:');
      result.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    if (result.detailedAnalysis) {
      console.log('\n🔍 상세 분석:');
      console.log(JSON.stringify(result.detailedAnalysis, null, 2));
    }

    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 서버가 실행되지 않았습니다. 다음 명령어로 서버를 시작해주세요:');
      console.log('   npm run dev');
    }
  }
}

// 테스트 실행
testImageSuitability();
