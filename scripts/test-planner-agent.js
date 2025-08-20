import { PlannerAgent } from './planner-agent.js';

// 테스트할 사용자 요청들
const testRequests = [
  {
    userRequest: "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션을 만들어줘",
    metadata: {
      coreObjective: "애니메이션 생성",
      primaryFunction: "움직이는 원",
      visualElements: { 
        colors: ["빨간색"], 
        shapes: ["원"] 
      },
      technicalRequirements: { 
        animation: true, 
        direction: "left-to-right" 
      }
    }
  },
  {
    userRequest: "파란색 사각형과 노란색 삼각형이 번갈아가며 나타나는 인터랙티브 캔버스를 생성해주세요",
    metadata: {
      coreObjective: "인터랙티브 캔버스 생성",
      primaryFunction: "도형 애니메이션",
      visualElements: { 
        colors: ["파란색", "노란색"], 
        shapes: ["사각형", "삼각형"] 
      },
      technicalRequirements: { 
        interactive: true, 
        canvas: true, 
        animation: true 
      }
    }
  },
  {
    userRequest: "데이터 시각화 차트를 그려주세요. 매출 데이터를 막대 그래프로 표시하고 반응형으로 만들어주세요",
    metadata: {
      coreObjective: "데이터 시각화",
      primaryFunction: "차트 생성",
      visualElements: { 
        chartType: ["막대 그래프"], 
        dataType: ["매출"] 
      },
      technicalRequirements: { 
        responsive: true, 
        dataVisualization: true,
        chart: true
      }
    }
  },
  {
    userRequest: "애니메이션 배너를 만들어주세요. 제품 이미지가 슬라이드되면서 가격 정보가 표시되는 형태로요",
    metadata: {
      coreObjective: "애니메이션 배너 생성",
      primaryFunction: "제품 슬라이드쇼",
      visualElements: { 
        content: ["제품 이미지", "가격 정보"], 
        animation: ["슬라이드"] 
      },
      technicalRequirements: { 
        animation: true, 
        imageHandling: true,
        responsive: true
      }
    }
  },
  {
    userRequest: "간단한 게임 캔버스를 만들어주세요. 마우스 클릭으로 공을 튀기는 물리 시뮬레이션을 구현해주세요",
    metadata: {
      coreObjective: "게임 캔버스 생성",
      primaryFunction: "물리 시뮬레이션",
      visualElements: { 
        gameElements: ["공"], 
        interactions: ["마우스 클릭"] 
      },
      technicalRequirements: { 
        physics: true, 
        gameEngine: true,
        mouseInteraction: true,
        canvas: true
      }
    }
  }
];

// API 호출 함수
async function callPlannerAgentAPI(userRequest, metadata) {
  try {
    const response = await fetch('http://localhost:5173/api/planner-agent', {
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

// 직접 에이전트 테스트 함수
async function testPlannerAgentDirect() {
  console.log('=== 기획자 AI 에이전트 직접 테스트 시작 ===\n');
  
  const agent = new PlannerAgent();

  for (let i = 0; i < testRequests.length; i++) {
    const testCase = testRequests[i];
    console.log(`테스트 ${i + 1}: "${testCase.userRequest}"`);
    console.log('-'.repeat(60));

    try {
      const result = await agent.processUserRequest(testCase.userRequest, testCase.metadata);
      
      if (result.success) {
        console.log('✅ 성공');
        console.log('라우팅 결정:');
        console.log(result.data.routing_decision);
        console.log('\n상세 명세:');
        console.log(result.data.detailed_specification);
        
        if (result.data.agent_steps && result.data.agent_steps.length > 0) {
          console.log('\n에이전트 실행 단계:');
          result.data.agent_steps.forEach((step, index) => {
            console.log(`  단계 ${index + 1}: ${step.action.tool}`);
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

  console.log('=== 직접 테스트 완료 ===');
}

// API 테스트 함수
async function testPlannerAgentAPI() {
  console.log('=== 기획자 AI 에이전트 API 테스트 시작 ===\n');

  for (let i = 0; i < testRequests.length; i++) {
    const testCase = testRequests[i];
    console.log(`API 테스트 ${i + 1}: "${testCase.userRequest}"`);
    console.log('-'.repeat(60));

    try {
      const result = await callPlannerAgentAPI(testCase.userRequest, testCase.metadata);
      
      if (result.success) {
        console.log('✅ API 성공');
        console.log('라우팅 결정:');
        console.log(result.data.routing_decision);
        console.log('\n상세 명세:');
        console.log(result.data.detailed_specification);
        
        if (result.data.agent_steps && result.data.agent_steps.length > 0) {
          console.log('\n에이전트 실행 단계:');
          result.data.agent_steps.forEach((step, index) => {
            console.log(`  단계 ${index + 1}: ${step.action.tool}`);
          });
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
async function testPlannerAgentPerformance() {
  console.log('=== 기획자 AI 에이전트 성능 테스트 시작 ===\n');
  
  const agent = new PlannerAgent();
  const testCase = testRequests[0]; // 첫 번째 테스트 케이스 사용
  
  console.log('테스트 요청:', testCase.userRequest);
  console.log('-'.repeat(60));

  const startTime = Date.now();
  
  try {
    const result = await agent.processUserRequest(testCase.userRequest, testCase.metadata);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (result.success) {
      console.log('✅ 성능 테스트 성공');
      console.log(`총 실행 시간: ${duration}ms`);
      console.log(`라우팅 시간: ~${Math.round(duration * 0.2)}ms (추정)`);
      console.log(`에이전트 실행 시간: ~${Math.round(duration * 0.8)}ms (추정)`);
      
      if (result.data.agent_steps) {
        console.log(`총 에이전트 단계: ${result.data.agent_steps.length}`);
        console.log(`평균 단계당 시간: ${Math.round(duration / result.data.agent_steps.length)}ms`);
      }
      
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

// 메인 테스트 함수
async function runAllTests() {
  console.log('🚀 기획자 AI 에이전트 종합 테스트 시작\n');
  
  // 1. 직접 테스트
  await testPlannerAgentDirect();
  
  console.log('\n' + '🔄'.repeat(20) + '\n');
  
  // 2. API 테스트 (서버가 실행 중인 경우)
  try {
    await testPlannerAgentAPI();
  } catch (error) {
    console.log('⚠️ API 테스트 건너뜀 (서버가 실행되지 않음)');
  }
  
  console.log('\n' + '🔄'.repeat(20) + '\n');
  
  // 3. 성능 테스트
  await testPlannerAgentPerformance();
  
  console.log('\n🎉 모든 테스트 완료!');
}

// 스크립트 실행
if (process.argv[1] && process.argv[1].includes('test-planner-agent.js')) {
  runAllTests().catch(console.error);
}

export { 
  testPlannerAgentDirect, 
  testPlannerAgentAPI, 
  testPlannerAgentPerformance, 
  runAllTests 
};
