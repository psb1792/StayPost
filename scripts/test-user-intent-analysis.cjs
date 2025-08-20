const fs = require('fs');
const path = require('path');

// 테스트할 사용자 요청들
const testRequests = [
  "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션을 만들어줘",
  "파란색 사각형과 노란색 삼각형이 번갈아가며 나타나는 인터랙티브 캔버스를 생성해주세요",
  "회사 로고와 함께 '환영합니다'라는 텍스트가 페이드인되는 정적 이미지를 만들어줘",
  "데이터 시각화 차트를 그려주세요. 매출 데이터를 막대 그래프로 표시하고 반응형으로 만들어주세요",
  "애니메이션 배너를 만들어주세요. 제품 이미지가 슬라이드되면서 가격 정보가 표시되는 형태로요",
  "간단한 게임 캔버스를 만들어주세요. 마우스 클릭으로 공을 튀기는 물리 시뮬레이션을 구현해주세요"
];

// API 호출 함수
async function testUserIntentAnalysis(userRequest) {
  try {
    const response = await fetch('http://localhost:5173/api/user-intent-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRequest: userRequest,
        context: {
          // 테스트용 컨텍스트
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API 호출 오류:', error);
    return { success: false, error: error.message };
  }
}

// 메인 테스트 함수
async function runTests() {
  console.log('=== 사용자 의도 분석 테스트 시작 ===\n');

  for (let i = 0; i < testRequests.length; i++) {
    const request = testRequests[i];
    console.log(`테스트 ${i + 1}: "${request}"`);
    console.log('-'.repeat(50));

    try {
      const result = await testUserIntentAnalysis(request);
      
      if (result.success) {
        console.log('✅ 성공');
        console.log('분석 결과:');
        console.log(JSON.stringify(result.data, null, 2));
        
        // 신뢰도 확인
        if (result.data.confidence) {
          console.log(`신뢰도: ${(result.data.confidence * 100).toFixed(1)}%`);
        }
        
        // 핵심 정보 출력
        console.log(`핵심 목표: ${result.data.coreObjective}`);
        console.log(`주요 기능: ${result.data.primaryFunction}`);
        console.log(`추출된 데이터: ${result.data.keyData.join(', ')}`);
        
        if (result.data.visualElements) {
          console.log('시각적 요소:');
          Object.entries(result.data.visualElements).forEach(([key, value]) => {
            if (value && value.length > 0) {
              console.log(`  ${key}: ${value.join(', ')}`);
            }
          });
        }
        
        if (result.data.technicalRequirements) {
          console.log('기술적 요구사항:');
          Object.entries(result.data.technicalRequirements).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              console.log(`  ${key}: ${value}`);
            }
          });
        }
        
      } else {
        console.log('❌ 실패');
        console.log('오류:', result.error);
      }
    } catch (error) {
      console.log('❌ 예외 발생');
      console.log('오류:', error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  console.log('=== 테스트 완료 ===');
}

// 스크립트 실행
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testUserIntentAnalysis, runTests };
