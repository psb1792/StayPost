import { IntegratedAIPipeline } from './integrated-ai-pipeline.js';

// 테스트할 요청들
const testRequests = [
  {
    userRequest: "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션을 만들어줘",
    metadata: {
      coreObjective: "애니메이션 생성",
      primaryFunction: "움직이는 원",
      visualElements: { colors: ["빨간색"], shapes: ["원"] },
      technicalRequirements: { animation: true, direction: "left-to-right" }
    }
  },
  {
    userRequest: "데이터 시각화 차트를 그려주세요. 매출 데이터를 막대 그래프로 표시하고 반응형으로 만들어주세요",
    metadata: {
      coreObjective: "데이터 시각화",
      primaryFunction: "차트 생성",
      visualElements: { chartType: ["막대 그래프"], dataType: ["매출"] },
      technicalRequirements: { responsive: true, dataVisualization: true }
    }
  },
  {
    userRequest: "파란색 사각형과 노란색 삼각형이 번갈아가며 나타나는 인터랙티브 캔버스를 생성해주세요",
    metadata: {
      coreObjective: "인터랙티브 캔버스 생성",
      primaryFunction: "도형 애니메이션",
      visualElements: { colors: ["파란색", "노란색"], shapes: ["사각형", "삼각형"] },
      technicalRequirements: { interactive: true, canvas: true, animation: true }
    }
  }
];

// API 호출 함수
async function callIntegratedPipelineAPI(userRequest, metadata) {
  try {
    const response = await fetch('http://localhost:5173/api/integrated-pipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRequest: userRequest,
        metadata: metadata
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

// 직접 파이프라인 테스트 함수
async function testIntegratedPipelineDirect() {
  console.log('=== 통합 AI 파이프라인 직접 테스트 시작 ===\n');
  
  const pipeline = new IntegratedAIPipeline();

  for (let i = 0; i < testRequests.length; i++) {
    const testCase = testRequests[i];
    console.log(`테스트 ${i + 1}: "${testCase.userRequest}"`);
    console.log('-'.repeat(60));

    try {
      const result = await pipeline.processUserRequest(testCase.userRequest, testCase.metadata);
      
      if (result.success) {
        console.log('✅ 파이프라인 성공');
        console.log('생성된 파일:', result.data.summary.generatedFile);
        console.log('검증 점수:', result.data.summary.validationScore);
        console.log('품질 점수:', result.data.summary.qualityScore);
        console.log('결과 파일:', result.data.resultFilePath);
        console.log('코드 파일:', result.data.generatedCodePath);
        
        // 파이프라인 결과 상세 정보
        console.log('\n📋 파이프라인 결과 상세:');
        console.log('- 사용자 요청:', result.data.pipelineResult.userRequest);
        console.log('- 타임스탬프:', result.data.pipelineResult.timestamp);
        console.log('- 파이프라인 버전:', result.data.pipelineResult.pipelineVersion);
        
        // 기획자 AI 결과
        if (result.data.pipelineResult.plannerResult) {
          console.log('- 기획자 AI 라우팅:', result.data.pipelineResult.plannerResult.routing_decision);
          console.log('- 기획자 AI 단계 수:', result.data.pipelineResult.plannerResult.agent_steps?.length || 0);
        }
        
        // 개발자 AI 결과
        if (result.data.pipelineResult.developerResult) {
          console.log('- 개발자 AI 검증 점수:', result.data.pipelineResult.developerResult.validation.score);
          console.log('- 개발자 AI 품질 점수:', result.data.pipelineResult.developerResult.qualityAnalysis?.overallScore || 'N/A');
        }
        
      } else {
        console.log('❌ 파이프라인 실패');
        console.log('오류:', result.error);
        console.log('실패 단계:', result.step);
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
async function testIntegratedPipelineAPI() {
  console.log('=== 통합 AI 파이프라인 API 테스트 시작 ===\n');

  for (let i = 0; i < testRequests.length; i++) {
    const testCase = testRequests[i];
    console.log(`API 테스트 ${i + 1}: "${testCase.userRequest}"`);
    console.log('-'.repeat(60));

    try {
      const result = await callIntegratedPipelineAPI(testCase.userRequest, testCase.metadata);
      
      if (result.success) {
        console.log('✅ API 성공');
        console.log('생성된 파일:', result.data.summary.generatedFile);
        console.log('검증 점수:', result.data.summary.validationScore);
        console.log('품질 점수:', result.data.summary.qualityScore);
        console.log('결과 파일:', result.data.resultFilePath);
        
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
async function testPipelinePerformance() {
  console.log('=== 통합 AI 파이프라인 성능 테스트 시작 ===\n');
  
  const pipeline = new IntegratedAIPipeline();
  const testCase = testRequests[0]; // 첫 번째 테스트 케이스 사용
  
  console.log('테스트 요청:', testCase.userRequest);
  console.log('-'.repeat(60));

  const startTime = Date.now();
  
  try {
    const result = await pipeline.processUserRequest(testCase.userRequest, testCase.metadata);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (result.success) {
      console.log('✅ 성능 테스트 성공');
      console.log(`총 실행 시간: ${duration}ms`);
      console.log(`기획자 AI 시간: ~${Math.round(duration * 0.4)}ms (추정)`);
      console.log(`개발자 AI 시간: ~${Math.round(duration * 0.6)}ms (추정)`);
      console.log(`평균 단계별 시간: ~${Math.round(duration / 3)}ms`);
      
      console.log(`생성된 코드 크기: ${result.data.generatedCodePath ? '파일 생성됨' : 'N/A'}`);
      console.log(`검증 점수: ${result.data.summary.validationScore}/100`);
      console.log(`품질 점수: ${result.data.summary.qualityScore}/100`);
      
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

// 배치 처리 테스트 함수
async function testBatchProcessing() {
  console.log('=== 배치 처리 테스트 시작 ===\n');
  
  const pipeline = new IntegratedAIPipeline();
  
  const batchRequests = [
    {
      userRequest: "파란색 사각형을 그려주세요",
      metadata: { 
        coreObjective: "도형 그리기", 
        primaryFunction: "사각형 렌더링",
        visualElements: { colors: ["파란색"], shapes: ["사각형"] }
      }
    },
    {
      userRequest: "노란색 삼각형을 그려주세요",
      metadata: { 
        coreObjective: "도형 그리기", 
        primaryFunction: "삼각형 렌더링",
        visualElements: { colors: ["노란색"], shapes: ["삼각형"] }
      }
    },
    {
      userRequest: "초록색 원을 그려주세요",
      metadata: { 
        coreObjective: "도형 그리기", 
        primaryFunction: "원 렌더링",
        visualElements: { colors: ["초록색"], shapes: ["원"] }
      }
    }
  ];

  console.log(`배치 처리 요청 수: ${batchRequests.length}`);
  console.log('-'.repeat(60));

  const startTime = Date.now();
  
  try {
    const batchResult = await pipeline.processBatchRequests(batchRequests);
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    console.log('✅ 배치 처리 완료');
    console.log('📊 배치 처리 결과:');
    console.log(`- 총 요청: ${batchResult.summary.totalRequests}개`);
    console.log(`- 성공: ${batchResult.summary.successCount}개`);
    console.log(`- 실패: ${batchResult.summary.failureCount}개`);
    console.log(`- 총 소요 시간: ${totalDuration}ms`);
    console.log(`- 평균 처리 시간: ${batchResult.summary.averageDuration}ms`);
    console.log(`- 처리율: ${((batchResult.summary.successCount / batchResult.summary.totalRequests) * 100).toFixed(1)}%`);
    
    // 개별 결과 요약
    console.log('\n📋 개별 결과:');
    batchResult.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} 요청 ${index + 1}: ${result.success ? '성공' : '실패'}`);
      if (!result.success) {
        console.log(`  오류: ${result.error}`);
      }
    });
    
  } catch (error) {
    console.log('❌ 배치 처리 실패');
    console.log('오류:', error.message);
  }

  console.log('\n' + '='.repeat(80) + '\n');
  console.log('=== 배치 처리 테스트 완료 ===');
}

// 품질 비교 테스트 함수
async function testQualityComparison() {
  console.log('=== 품질 비교 테스트 시작 ===\n');
  
  const pipeline = new IntegratedAIPipeline();

  for (let i = 0; i < testRequests.length; i++) {
    const testCase = testRequests[i];
    console.log(`품질 테스트 ${i + 1}: "${testCase.userRequest}"`);
    console.log('-'.repeat(60));

    try {
      const result = await pipeline.processUserRequest(testCase.userRequest, testCase.metadata);
      
      if (result.success) {
        console.log('✅ 품질 분석 완료');
        console.log('검증 점수:', result.data.summary.validationScore + '/100');
        console.log('품질 점수:', result.data.summary.qualityScore + '/100');
        
        // 품질 등급 평가
        const validationScore = result.data.summary.validationScore;
        const qualityScore = result.data.summary.qualityScore;
        
        let validationGrade = 'F';
        if (validationScore >= 90) validationGrade = 'A+';
        else if (validationScore >= 80) validationGrade = 'A';
        else if (validationScore >= 70) validationGrade = 'B';
        else if (validationScore >= 60) validationGrade = 'C';
        else if (validationScore >= 50) validationGrade = 'D';
        
        let qualityGrade = 'F';
        if (qualityScore >= 90) qualityGrade = 'A+';
        else if (qualityScore >= 80) qualityGrade = 'A';
        else if (qualityScore >= 70) qualityGrade = 'B';
        else if (qualityScore >= 60) qualityGrade = 'C';
        else if (qualityScore >= 50) qualityGrade = 'D';
        
        console.log('검증 등급:', validationGrade);
        console.log('품질 등급:', qualityGrade);
        
        // 종합 평가
        const averageScore = (validationScore + qualityScore) / 2;
        let overallGrade = 'F';
        if (averageScore >= 90) overallGrade = 'A+';
        else if (averageScore >= 80) overallGrade = 'A';
        else if (averageScore >= 70) overallGrade = 'B';
        else if (averageScore >= 60) overallGrade = 'C';
        else if (averageScore >= 50) overallGrade = 'D';
        
        console.log('종합 점수:', averageScore.toFixed(1) + '/100');
        console.log('종합 등급:', overallGrade);
        
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

  console.log('=== 품질 비교 테스트 완료 ===');
}

// 메인 테스트 함수
async function runAllTests() {
  console.log('🚀 통합 AI 파이프라인 종합 테스트 시작\n');
  
  // 1. 직접 테스트
  await testIntegratedPipelineDirect();
  
  console.log('\n' + '🔄'.repeat(20) + '\n');
  
  // 2. API 테스트 (서버가 실행 중인 경우)
  try {
    await testIntegratedPipelineAPI();
  } catch (error) {
    console.log('⚠️ API 테스트 건너뜀 (서버가 실행되지 않음)');
  }
  
  console.log('\n' + '🔄'.repeat(20) + '\n');
  
  // 3. 성능 테스트
  await testPipelinePerformance();
  
  console.log('\n' + '🔄'.repeat(20) + '\n');
  
  // 4. 배치 처리 테스트
  await testBatchProcessing();
  
  console.log('\n' + '🔄'.repeat(20) + '\n');
  
  // 5. 품질 비교 테스트
  await testQualityComparison();
  
  console.log('\n🎉 모든 테스트 완료!');
}

// 스크립트 실행
if (process.argv[1] && process.argv[1].includes('test-integrated-pipeline.js')) {
  runAllTests().catch(console.error);
}

export { 
  testIntegratedPipelineDirect, 
  testIntegratedPipelineAPI, 
  testPipelinePerformance, 
  testBatchProcessing,
  testQualityComparison,
  runAllTests 
};
