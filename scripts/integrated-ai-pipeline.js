import { PlannerAgent } from './planner-agent.js';
import { DeveloperAgent } from './developer-agent.js';
import fs from 'fs';
import path from 'path';

// 환경 변수 로드
import dotenv from 'dotenv';
dotenv.config();

class IntegratedAIPipeline {
  constructor() {
    this.plannerAgent = new PlannerAgent();
    this.developerAgent = new DeveloperAgent();
  }

  // 통합 파이프라인 실행
  async processUserRequest(userRequest, metadata) {
    try {
      console.log('🚀 통합 AI 파이프라인 시작...');
      console.log('사용자 요청:', userRequest);
      console.log('메타데이터:', metadata);

      // Step 1: 기획자 AI 에이전트 실행
      console.log('\n📋 Step 1: 기획자 AI 에이전트 실행 중...');
      const plannerResult = await this.plannerAgent.processUserRequest(userRequest, metadata);
      
      if (!plannerResult.success) {
        throw new Error(`기획자 AI 에이전트 실패: ${plannerResult.error}`);
      }

      console.log('✅ 기획자 AI 에이전트 완료');
      console.log('라우팅 결정:', plannerResult.data.routing_decision);

      // Step 2: 상세 명세 파싱
      console.log('\n🔍 Step 2: 상세 명세 파싱 중...');
      let specification;
      try {
        // JSON 문자열에서 객체로 파싱
        if (typeof plannerResult.data.detailed_specification === 'string') {
          specification = JSON.parse(plannerResult.data.detailed_specification);
        } else {
          specification = plannerResult.data.detailed_specification;
        }
      } catch (parseError) {
        console.warn('⚠️ 명세서 파싱 실패, 기본 구조 사용');
        specification = this.createDefaultSpecification(userRequest, metadata);
      }

      console.log('✅ 상세 명세 파싱 완료');

      // Step 3: 개발자 AI 에이전트 실행
      console.log('\n👨‍💻 Step 3: 개발자 AI 에이전트 실행 중...');
      const developerResult = await this.developerAgent.generateCode(specification);
      
      if (!developerResult.success) {
        throw new Error(`개발자 AI 에이전트 실패: ${developerResult.error}`);
      }

      console.log('✅ 개발자 AI 에이전트 완료');
      console.log('생성된 파일:', developerResult.data.filePath);

      // Step 4: 결과 통합 및 저장
      console.log('\n💾 Step 4: 결과 통합 및 저장 중...');
      const pipelineResult = {
        userRequest: userRequest,
        metadata: metadata,
        plannerResult: plannerResult.data,
        developerResult: developerResult.data,
        specification: specification,
        timestamp: new Date().toISOString(),
        pipelineVersion: '1.0.0'
      };

      // 파이프라인 결과 저장
      const resultFileName = this.generateResultFileName(userRequest);
      const resultFilePath = path.join(process.cwd(), 'generated', 'pipeline-results', resultFileName);
      
      // 디렉토리 생성
      const dir = path.dirname(resultFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 결과 저장
      fs.writeFileSync(resultFilePath, JSON.stringify(pipelineResult, null, 2), 'utf8');
      console.log('✅ 파이프라인 결과 저장 완료:', resultFilePath);

      return {
        success: true,
        data: {
          pipelineResult: pipelineResult,
          resultFilePath: resultFilePath,
          generatedCodePath: developerResult.data.filePath,
          summary: {
            userRequest: userRequest,
            generatedFile: developerResult.data.fileName,
            validationScore: developerResult.data.validation.score,
            qualityScore: developerResult.data.qualityAnalysis?.overallScore || 'N/A'
          }
        }
      };

    } catch (error) {
      console.error('❌ 통합 AI 파이프라인 실행 오류:', error);
      return {
        success: false,
        error: error.message,
        step: this.getCurrentStep()
      };
    }
  }

  // 기본 명세서 생성
  createDefaultSpecification(userRequest, metadata) {
    return {
      project: {
        name: "Canvas 프로젝트",
        description: userRequest,
        version: "1.0.0"
      },
      requirements: {
        functional: ["기본 기능 구현"],
        non_functional: ["성능 최적화", "반응형 디자인"]
      },
      architecture: {
        components: ["Canvas", "Renderer", "Controller"],
        data_flow: "사용자 입력 → 컨트롤러 → 렌더러 → 캔버스",
        interfaces: ["RenderInterface", "ControlInterface"]
      },
      implementation: {
        technologies: ["HTML5 Canvas", "JavaScript", "CSS3"],
        dependencies: ["requestAnimationFrame"],
        file_structure: "src/components/"
      },
      ui_specification: {
        layout: "캔버스 + 컨트롤",
        components: ["메인 캔버스", "컨트롤 패널"],
        styles: "기본 스타일",
        interactions: ["기본 인터랙션"]
      },
      data_specification: {
        models: ["기본 모델"],
        api_endpoints: [],
        validation: "기본 검증"
      }
    };
  }

  // 결과 파일명 생성
  generateResultFileName(userRequest) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const requestHash = this.hashString(userRequest).slice(0, 8);
    return `pipeline-result-${timestamp}-${requestHash}.json`;
  }

  // 문자열 해시 생성
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash).toString(16);
  }

  // 현재 단계 추적
  getCurrentStep() {
    return 'pipeline-execution';
  }

  // 파이프라인 성능 분석
  async analyzePipelinePerformance(userRequest, metadata) {
    const startTime = Date.now();
    
    try {
      const result = await this.processUserRequest(userRequest, metadata);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (result.success) {
        return {
          success: true,
          performance: {
            totalDuration: duration,
            plannerAgentTime: Math.round(duration * 0.4), // 추정
            developerAgentTime: Math.round(duration * 0.6), // 추정
            averageTimePerStep: Math.round(duration / 3)
          },
          quality: {
            validationScore: result.data.summary.validationScore,
            qualityScore: result.data.summary.qualityScore,
            generatedCodeSize: fs.statSync(result.data.generatedCodePath).size
          }
        };
      } else {
        return {
          success: false,
          error: result.error,
          duration: duration
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  // 배치 처리
  async processBatchRequests(requests) {
    console.log(`🔄 배치 처리 시작: ${requests.length}개 요청`);
    
    const results = [];
    const startTime = Date.now();
    
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      console.log(`\n--- 배치 ${i + 1}/${requests.length} ---`);
      console.log('요청:', request.userRequest);
      
      try {
        const result = await this.processUserRequest(request.userRequest, request.metadata);
        results.push({
          index: i,
          success: result.success,
          data: result.data,
          error: result.error
        });
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }
    
    const totalDuration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    
    console.log(`\n📊 배치 처리 완료:`);
    console.log(`- 총 요청: ${requests.length}개`);
    console.log(`- 성공: ${successCount}개`);
    console.log(`- 실패: ${requests.length - successCount}개`);
    console.log(`- 총 소요 시간: ${totalDuration}ms`);
    console.log(`- 평균 처리 시간: ${Math.round(totalDuration / requests.length)}ms`);
    
    return {
      results: results,
      summary: {
        totalRequests: requests.length,
        successCount: successCount,
        failureCount: requests.length - successCount,
        totalDuration: totalDuration,
        averageDuration: Math.round(totalDuration / requests.length)
      }
    };
  }
}

// 테스트 함수
async function testIntegratedPipeline() {
  const pipeline = new IntegratedAIPipeline();
  
  const testCases = [
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
    }
  ];

  console.log('🚀 통합 AI 파이프라인 테스트 시작\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`=== 테스트 케이스 ${i + 1} ===`);
    console.log('사용자 요청:', testCase.userRequest);
    
    const result = await pipeline.processUserRequest(testCase.userRequest, testCase.metadata);
    
    if (result.success) {
      console.log('✅ 파이프라인 성공');
      console.log('생성된 파일:', result.data.summary.generatedFile);
      console.log('검증 점수:', result.data.summary.validationScore);
      console.log('품질 점수:', result.data.summary.qualityScore);
      console.log('결과 파일:', result.data.resultFilePath);
    } else {
      console.log('❌ 파이프라인 실패:', result.error);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  }

  // 성능 분석 테스트
  console.log('📊 성능 분석 테스트');
  const performanceResult = await pipeline.analyzePipelinePerformance(
    testCases[0].userRequest,
    testCases[0].metadata
  );
  
  if (performanceResult.success) {
    console.log('총 소요 시간:', performanceResult.performance.totalDuration + 'ms');
    console.log('기획자 AI 시간:', performanceResult.performance.plannerAgentTime + 'ms');
    console.log('개발자 AI 시간:', performanceResult.performance.developerAgentTime + 'ms');
    console.log('평균 단계별 시간:', performanceResult.performance.averageTimePerStep + 'ms');
  }

  console.log('\n🎉 통합 AI 파이프라인 테스트 완료!');
}

// 배치 처리 테스트
async function testBatchProcessing() {
  const pipeline = new IntegratedAIPipeline();
  
  const batchRequests = [
    {
      userRequest: "파란색 사각형을 그려주세요",
      metadata: { coreObjective: "도형 그리기", primaryFunction: "사각형 렌더링" }
    },
    {
      userRequest: "노란색 삼각형을 그려주세요",
      metadata: { coreObjective: "도형 그리기", primaryFunction: "삼각형 렌더링" }
    },
    {
      userRequest: "초록색 원을 그려주세요",
      metadata: { coreObjective: "도형 그리기", primaryFunction: "원 렌더링" }
    }
  ];

  console.log('🔄 배치 처리 테스트 시작\n');
  
  const batchResult = await pipeline.processBatchRequests(batchRequests);
  
  console.log('배치 처리 결과:', batchResult.summary);
}

// 모듈 내보내기
export { IntegratedAIPipeline, testIntegratedPipeline, testBatchProcessing };

// 직접 실행 시 테스트
if (process.argv[1] && process.argv[1].includes('integrated-ai-pipeline.js')) {
  testIntegratedPipeline().catch(console.error);
}
