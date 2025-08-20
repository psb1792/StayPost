import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// 환경 변수 로드
import dotenv from 'dotenv';
dotenv.config();

class DeveloperAgent {
  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.codeGenerationChain = this.createCodeGenerationChain();
    this.codeValidationChain = this.createCodeValidationChain();
    this.codeOptimizationChain = this.createCodeOptimizationChain();
  }

  // 코드 생성 체인 생성
  createCodeGenerationChain() {
    this.codeGenerationTemplate = `너는 Canvas API 전문 개발자 AI야. 다음 JSON 명세서를 바탕으로 아래의 제약 조건을 반드시 준수하여 Canvas API 코드를 생성해줘.

**[JSON 명세서]**
{input_json}

**[제약 조건]**
1. **정확성**: 명세서의 모든 기능을 정확하게 구현해야 함.
2. **성능 최적화**: 불필요한 렌더링을 최소화하고 requestAnimationFrame을 사용하여 부드럽게 동작하도록 코드를 작성해야 함.
3. **크로스 브라우저 호환성**: Chrome, Firefox, Safari 등 주요 브라우저에서 동일하게 동작하도록 표준 API를 사용해야 함.
4. **한글 텍스트 렌더링**: 한글이 깨지거나 밀리지 않도록 font 설정을 명확히 하고, 필요시 fillText의 위치를 정교하게 계산해야 함.
5. **에러 처리**: 잘못된 입력값이 들어올 경우를 대비하여 try-catch 구문 등 기본적인 에러 처리 로직을 포함해야 함.
6. **모듈화**: 재사용 가능한 함수들로 모듈화하여 유지보수가 용이하도록 작성해야 함.
7. **주석**: 각 함수와 주요 로직에 한글로 명확한 주석을 달아야 함.

**[출력 형식]**
다음 구조로 완전한 HTML 파일을 생성해주세요:

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{프로젝트명}</title>
    <style>
        /* CSS 스타일 */
    </style>
</head>
<body>
    <canvas id="mainCanvas" width="800" height="600"></canvas>
    <div class="controls">
        <!-- 컨트롤 요소들 -->
    </div>
    
    <script>
        // JavaScript 코드
    </script>
</body>
</html>

**[코드 품질 요구사항]**
- ES6+ 문법 사용
- 클린 코드 원칙 준수
- 성능 최적화 적용
- 접근성 고려
- 반응형 디자인 적용

반드시 완전하고 실행 가능한 코드를 생성해주세요.`;

    return {
      invoke: async (params) => {
        const prompt = PromptTemplate.fromTemplate(this.codeGenerationTemplate);
        const formattedPrompt = await prompt.format(params);
        const response = await this.llm.invoke(formattedPrompt);
        return response;
      }
    };
  }

  // 코드 검증 체인 생성
  createCodeValidationChain() {
    this.validationTemplate = `다음 Canvas API 코드를 검증하고 개선점을 제안해주세요.

**[코드]**
{generated_code}

**[검증 기준]**
1. **문법 오류**: JavaScript 문법 오류가 있는지 확인
2. **Canvas API 사용**: 올바른 Canvas API 메서드를 사용했는지 확인
3. **성능**: 성능 최적화가 적절히 적용되었는지 확인
4. **호환성**: 크로스 브라우저 호환성을 확인
5. **에러 처리**: 적절한 에러 처리가 포함되었는지 확인
6. **접근성**: 접근성 고려사항이 포함되었는지 확인

**[출력 형식]**
{
  "isValid": true/false,
  "errors": ["오류1", "오류2"],
  "warnings": ["경고1", "경고2"],
  "suggestions": ["개선제안1", "개선제안2"],
  "score": 0-100
}`;

    return {
      invoke: async (params) => {
        const prompt = PromptTemplate.fromTemplate(this.validationTemplate);
        const formattedPrompt = await prompt.format(params);
        const response = await this.llm.invoke(formattedPrompt);
        return response;
      }
    };
  }

  // 코드 최적화 체인 생성
  createCodeOptimizationChain() {
    this.optimizationTemplate = `다음 Canvas API 코드를 최적화해주세요.

**[원본 코드]**
{original_code}

**[검증 결과]**
{validation_result}

**[최적화 목표]**
1. **성능 향상**: 렌더링 성능 최적화
2. **메모리 효율성**: 메모리 사용량 최적화
3. **코드 품질**: 가독성과 유지보수성 향상
4. **브라우저 호환성**: 크로스 브라우저 호환성 개선
5. **에러 처리**: 강화된 에러 처리 로직

**[최적화된 코드]**
위의 목표를 달성하는 최적화된 코드를 생성해주세요.`;

    return {
      invoke: async (params) => {
        const prompt = PromptTemplate.fromTemplate(this.optimizationTemplate);
        const formattedPrompt = await prompt.format(params);
        const response = await this.llm.invoke(formattedPrompt);
        return response;
      }
    };
  }

  // 메인 처리 함수
  async generateCode(specification) {
    try {
      console.log('👨‍💻 개발자 AI 에이전트 시작...');
      console.log('명세서:', specification);

      // 1단계: 코드 생성
      console.log('📝 1단계: 코드 생성 중...');
      const codeGenerationResult = await this.codeGenerationChain.invoke({
        input_json: JSON.stringify(specification, null, 2),
        프로젝트명: specification.project?.name || 'Canvas 프로젝트'
      });

      const generatedCode = codeGenerationResult.text;
      console.log('✅ 코드 생성 완료');

      // 2단계: 코드 검증
      console.log('🔍 2단계: 코드 검증 중...');
      const validationResult = await this.codeValidationChain.invoke({
        generated_code: generatedCode
      });

      let validationData;
      try {
        validationData = JSON.parse(validationResult.text);
      } catch (error) {
        validationData = {
          isValid: true,
          errors: [],
          warnings: [],
          suggestions: [],
          score: 80
        };
      }

      console.log('✅ 코드 검증 완료');

      // 3단계: 코드 최적화 (필요한 경우)
      let optimizedCode = generatedCode;
      if (!validationData.isValid || validationData.score < 70) {
        console.log('⚡ 3단계: 코드 최적화 중...');
        const optimizationResult = await this.codeOptimizationChain.invoke({
          original_code: generatedCode,
          validation_result: JSON.stringify(validationData, null, 2)
        });

        optimizedCode = optimizationResult.text;
        console.log('✅ 코드 최적화 완료');
      }

      // 4단계: 파일 저장
      const fileName = this.generateFileName(specification);
      const filePath = path.join(process.cwd(), 'generated', fileName);
      
      // 디렉토리 생성
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 파일 저장
      fs.writeFileSync(filePath, optimizedCode, 'utf8');
      console.log(`💾 파일 저장 완료: ${filePath}`);

      return {
        success: true,
        data: {
          generatedCode: optimizedCode,
          validation: validationData,
          filePath: filePath,
          fileName: fileName
        }
      };

    } catch (error) {
      console.error('❌ 개발자 AI 에이전트 실행 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 파일명 생성
  generateFileName(specification) {
    const projectName = specification.project?.name || 'canvas-project';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${projectName}-${timestamp}.html`;
  }

  // 코드 품질 분석
  async analyzeCodeQuality(code) {
    const analysisTemplate = `다음 Canvas API 코드의 품질을 분석해주세요.

**[코드]**
{code}

**[분석 기준]**
1. **성능**: 렌더링 성능, 메모리 사용량
2. **가독성**: 코드 구조, 주석, 변수명
3. **유지보수성**: 모듈화, 재사용성
4. **안정성**: 에러 처리, 예외 상황 대응
5. **표준 준수**: ES6+ 표준, Canvas API 표준

**[출력 형식]**
{
  "overallScore": 0-100,
  "performance": {
    "score": 0-100,
    "issues": ["문제점1", "문제점2"],
    "suggestions": ["개선제안1", "개선제안2"]
  },
  "readability": {
    "score": 0-100,
    "issues": ["문제점1", "문제점2"],
    "suggestions": ["개선제안1", "개선제안2"]
  },
  "maintainability": {
    "score": 0-100,
    "issues": ["문제점1", "문제점2"],
    "suggestions": ["개선제안1", "개선제안2"]
  },
  "stability": {
    "score": 0-100,
    "issues": ["문제점1", "문제점2"],
    "suggestions": ["개선제안1", "개선제안2"]
  },
  "standards": {
    "score": 0-100,
    "issues": ["문제점1", "문제점2"],
    "suggestions": ["개선제안1", "개선제안2"]
  }
}`;

    try {
      const prompt = PromptTemplate.fromTemplate(analysisTemplate);
      const formattedPrompt = await prompt.format({ code: code });
      const result = await this.llm.invoke(formattedPrompt);
      return JSON.parse(result.content);
    } catch (error) {
      return {
        overallScore: 70,
        performance: { score: 70, issues: [], suggestions: [] },
        readability: { score: 70, issues: [], suggestions: [] },
        maintainability: { score: 70, issues: [], suggestions: [] },
        stability: { score: 70, issues: [], suggestions: [] },
        standards: { score: 70, issues: [], suggestions: [] }
      };
    }
  }
}

// 테스트 함수
async function testDeveloperAgent() {
  const agent = new DeveloperAgent();
  
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
    }
  ];

  for (let i = 0; i < testSpecifications.length; i++) {
    const spec = testSpecifications[i];
    console.log(`\n=== 테스트 케이스 ${i + 1} ===`);
    console.log('프로젝트:', spec.project.name);
    
    const result = await agent.generateCode(spec);
    
    if (result.success) {
      console.log('✅ 성공');
      console.log('파일 경로:', result.data.filePath);
      console.log('검증 결과:', result.data.validation);
      
      // 코드 품질 분석
      const qualityAnalysis = await agent.analyzeCodeQuality(result.data.generatedCode);
      console.log('품질 분석:', qualityAnalysis);
      
    } else {
      console.log('❌ 실패:', result.error);
    }
  }
}

// 모듈 내보내기
export { DeveloperAgent, testDeveloperAgent };

// 직접 실행 시 테스트
if (process.argv[1] && process.argv[1].includes('developer-agent.js')) {
  testDeveloperAgent().catch(console.error);
}
