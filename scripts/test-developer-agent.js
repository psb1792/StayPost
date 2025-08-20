import { DeveloperAgent } from './developer-agent.js';

// 테스트할 명세서들
const testSpecifications = [
  {
    project: {
      name: "애니메이션 원 프로젝트",
      description: "빨간색 원의 좌우 이동 애니메이션",
      version: "1.0.0"
    },
    requirements: {
      functional: ["원형 도형 렌더링", "좌우 이동 애니메이션", "빨간색 색상 적용"],
      non_functional: ["부드러운 애니메이션", "반응형 캔버스"]
    },
    architecture: {
      components: ["Canvas", "AnimationController", "CircleRenderer"],
      data_flow: "사용자 입력 → 애니메이션 컨트롤러 → 캔버스 렌더링",
      interfaces: ["AnimationInterface", "RenderInterface"]
    },
    implementation: {
      technologies: ["HTML5 Canvas", "JavaScript", "CSS3"],
      dependencies: ["requestAnimationFrame"],
      file_structure: "src/components/Animation/"
    },
    ui_specification: {
      layout: "전체 화면 캔버스",
      components: ["애니메이션 캔버스", "제어 패널"],
      styles: "빨간색 원, 부드러운 이동",
      interactions: ["애니메이션 시작/정지", "속도 조절"]
    },
    data_specification: {
      models: ["CircleModel", "AnimationModel"],
      api_endpoints: [],
      validation: "원의 위치와 속도 검증"
    }
  },
  {
    project: {
      name: "데이터 시각화 차트",
      description: "매출 데이터 막대 그래프",
      version: "1.0.0"
    },
    requirements: {
      functional: ["막대 그래프 렌더링", "데이터 표시", "반응형 레이아웃"],
      non_functional: ["성능 최적화", "접근성"]
    },
    architecture: {
      components: ["ChartCanvas", "DataRenderer", "AxisRenderer"],
      data_flow: "데이터 → 차트 렌더러 → 캔버스 출력",
      interfaces: ["ChartInterface", "DataInterface"]
    },
    implementation: {
      technologies: ["HTML5 Canvas", "JavaScript", "CSS3"],
      dependencies: [],
      file_structure: "src/components/Chart/"
    },
    ui_specification: {
      layout: "차트 영역 + 컨트롤 패널",
      components: ["차트 캔버스", "범례", "툴팁"],
      styles: "깔끔한 디자인, 색상 구분",
      interactions: ["호버 효과", "클릭 이벤트"]
    },
    data_specification: {
      models: ["ChartData", "BarModel"],
      api_endpoints: [],
      validation: "데이터 형식 검증"
    }
  },
  {
    project: {
      name: "인터랙티브 게임 캔버스",
      description: "마우스 클릭으로 공을 튀기는 물리 시뮬레이션",
      version: "1.0.0"
    },
    requirements: {
      functional: ["공 렌더링", "물리 시뮬레이션", "마우스 인터랙션"],
      non_functional: ["실시간 반응", "부드러운 애니메이션"]
    },
    architecture: {
      components: ["GameCanvas", "PhysicsEngine", "BallRenderer"],
      data_flow: "마우스 이벤트 → 물리 엔진 → 캔버스 렌더링",
      interfaces: ["GameInterface", "PhysicsInterface"]
    },
    implementation: {
      technologies: ["HTML5 Canvas", "JavaScript", "CSS3"],
      dependencies: ["requestAnimationFrame"],
      file_structure: "src/components/Game/"
    },
    ui_specification: {
      layout: "게임 캔버스 + 점수 표시",
      components: ["게임 캔버스", "점수판", "재시작 버튼"],
      styles: "게임 스타일, 동적 효과",
      interactions: ["마우스 클릭", "키보드 입력"]
    },
    data_specification: {
      models: ["BallModel", "PhysicsModel", "ScoreModel"],
      api_endpoints: [],
      validation: "물리 계산 검증"
    }
  }
];

// API 호출 함수
async function callDeveloperAgentAPI(specification) {
  try {
    const response = await fetch('http://localhost:5173/api/developer-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        specification: specification
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

// 직접 에이전트 테스트 함수
async function testDeveloperAgentDirect() {
  console.log('=== 개발자 AI 에이전트 직접 테스트 시작 ===\n');
  
  const agent = new DeveloperAgent();

  for (let i = 0; i < testSpecifications.length; i++) {
    const spec = testSpecifications[i];
    console.log(`테스트 ${i + 1}: "${spec.project.name}"`);
    console.log('-'.repeat(60));

    try {
      const result = await agent.generateCode(spec);
      
      if (result.success) {
        console.log('✅ 성공');
        console.log('파일 경로:', result.data.filePath);
        console.log('파일명:', result.data.fileName);
        console.log('검증 결과:');
        console.log('  - 유효성:', result.data.validation.isValid);
        console.log('  - 점수:', result.data.validation.score);
        console.log('  - 오류:', result.data.validation.errors);
        console.log('  - 경고:', result.data.validation.warnings);
        console.log('  - 제안:', result.data.validation.suggestions);
        
        // 코드 품질 분석
        const qualityAnalysis = await agent.analyzeCodeQuality(result.data.generatedCode);
        console.log('\n코드 품질 분석:');
        console.log('  - 전체 점수:', qualityAnalysis.overallScore);
        console.log('  - 성능:', qualityAnalysis.performance.score);
        console.log('  - 가독성:', qualityAnalysis.readability.score);
        console.log('  - 유지보수성:', qualityAnalysis.maintainability.score);
        console.log('  - 안정성:', qualityAnalysis.stability.score);
        console.log('  - 표준 준수:', qualityAnalysis.standards.score);
        
      } else {
        console.log('❌ 실패');
        console.log('오류:', result.error);
      }
    } catch (error) {
      console.log('❌ 예외 발생');
      console.log('오류:', error.message);
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  console.log('=== 직접 테스트 완료 ===');
}

// API 테스트 함수
async function testDeveloperAgentAPI() {
  console.log('=== 개발자 AI 에이전트 API 테스트 시작 ===\n');

  for (let i = 0; i < testSpecifications.length; i++) {
    const spec = testSpecifications[i];
    console.log(`API 테스트 ${i + 1}: "${spec.project.name}"`);
    console.log('-'.repeat(60));

    try {
      const result = await callDeveloperAgentAPI(spec);
      
      if (result.success) {
        console.log('✅ API 성공');
        console.log('파일 경로:', result.data.filePath);
        console.log('파일명:', result.data.fileName);
        console.log('검증 결과:');
        console.log('  - 유효성:', result.data.validation.isValid);
        console.log('  - 점수:', result.data.validation.score);
        
        if (result.data.qualityAnalysis) {
          console.log('\n코드 품질 분석:');
          console.log('  - 전체 점수:', result.data.qualityAnalysis.overallScore);
        }
        
      } else {
        console.log('❌ API 실패');
        console.log('오류:', result.error);
      }
    } catch (error) {
      console.log('❌ API 예외 발생');
      console.log('오류:', error.message);
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  console.log('=== API 테스트 완료 ===');
}

// 성능 테스트 함수
async function testDeveloperAgentPerformance() {
  console.log('=== 개발자 AI 에이전트 성능 테스트 시작 ===\n');
  
  const agent = new DeveloperAgent();
  const testSpec = testSpecifications[0]; // 첫 번째 테스트 케이스 사용
  
  console.log('테스트 명세:', testSpec.project.name);
  console.log('-'.repeat(60));

  const startTime = Date.now();
  
  try {
    const result = await agent.generateCode(testSpec);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (result.success) {
      console.log('✅ 성능 테스트 성공');
      console.log(`총 실행 시간: ${duration}ms`);
      console.log(`코드 생성 시간: ~${Math.round(duration * 0.6)}ms (추정)`);
      console.log(`코드 검증 시간: ~${Math.round(duration * 0.3)}ms (추정)`);
      console.log(`파일 저장 시간: ~${Math.round(duration * 0.1)}ms (추정)`);
      
      console.log(`생성된 코드 크기: ${result.data.generatedCode.length} 문자`);
      console.log(`검증 점수: ${result.data.validation.score}/100`);
      
    } else {
      console.log('❌ 성능 테스트 실패');
      console.log('오류:', result.error);
    }
  } catch (error) {
    console.log('❌ 성능 테스트 예외 발생');
    console.log('오류:', error.message);
  }

  console.log('\n' + '='.repeat(80) + '\n');
  console.log('=== 성능 테스트 완료 ===');
}

// 코드 품질 비교 테스트
async function testCodeQualityComparison() {
  console.log('=== 코드 품질 비교 테스트 시작 ===\n');
  
  const agent = new DeveloperAgent();

  for (let i = 0; i < testSpecifications.length; i++) {
    const spec = testSpecifications[i];
    console.log(`품질 테스트 ${i + 1}: "${spec.project.name}"`);
    console.log('-'.repeat(60));

    try {
      const result = await agent.generateCode(spec);
      
      if (result.success) {
        const qualityAnalysis = await agent.analyzeCodeQuality(result.data.generatedCode);
        
        console.log('✅ 품질 분석 완료');
        console.log('전체 점수:', qualityAnalysis.overallScore + '/100');
        console.log('성능:', qualityAnalysis.performance.score + '/100');
        console.log('가독성:', qualityAnalysis.readability.score + '/100');
        console.log('유지보수성:', qualityAnalysis.maintainability.score + '/100');
        console.log('안정성:', qualityAnalysis.stability.score + '/100');
        console.log('표준 준수:', qualityAnalysis.standards.score + '/100');
        
        // 개선 제안 출력
        if (qualityAnalysis.performance.suggestions.length > 0) {
          console.log('\n성능 개선 제안:');
          qualityAnalysis.performance.suggestions.forEach((suggestion, index) => {
            console.log(`  ${index + 1}. ${suggestion}`);
          });
        }
        
        if (qualityAnalysis.readability.suggestions.length > 0) {
          console.log('\n가독성 개선 제안:');
          qualityAnalysis.readability.suggestions.forEach((suggestion, index) => {
            console.log(`  ${index + 1}. ${suggestion}`);
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

    console.log('\n' + '='.repeat(80) + '\n');
  }

  console.log('=== 코드 품질 비교 테스트 완료 ===');
}

// 메인 테스트 함수
async function runAllTests() {
  console.log('🚀 개발자 AI 에이전트 종합 테스트 시작\n');
  
  // 1. 직접 테스트
  await testDeveloperAgentDirect();
  
  console.log('\n' + '🔄'.repeat(20) + '\n');
  
  // 2. API 테스트 (서버가 실행 중인 경우)
  try {
    await testDeveloperAgentAPI();
  } catch (error) {
    console.log('⚠️ API 테스트 건너뜀 (서버가 실행되지 않음)');
  }
  
  console.log('\n' + '🔄'.repeat(20) + '\n');
  
  // 3. 성능 테스트
  await testDeveloperAgentPerformance();
  
  console.log('\n' + '🔄'.repeat(20) + '\n');
  
  // 4. 코드 품질 비교 테스트
  await testCodeQualityComparison();
  
  console.log('\n🎉 모든 테스트 완료!');
}

// 스크립트 실행
if (process.argv[1] && process.argv[1].includes('test-developer-agent.js')) {
  runAllTests().catch(console.error);
}

export { 
  testDeveloperAgentDirect, 
  testDeveloperAgentAPI, 
  testDeveloperAgentPerformance, 
  testCodeQualityComparison,
  runAllTests 
};
