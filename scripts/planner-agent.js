import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// 환경 변수 로드
import dotenv from 'dotenv';
dotenv.config();

class PlannerAgent {
  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.tools = this.createTools();
    this.routerChain = this.createRouterChain();
  }

  // 도구들 생성
  createTools() {
    const tools = [
      // 데이터베이스 검색 도구
      new DynamicStructuredTool({
        name: 'database_search',
        description: '사용자 의도와 관련된 데이터베이스 정보를 검색합니다. UI 패턴, 컴포넌트, 스타일 정보 등을 찾을 때 사용합니다.',
        schema: z.object({
          query: z.string().describe('검색할 쿼리'),
          category: z.enum(['ui_patterns', 'components', 'styles', 'animations', 'layouts']).describe('검색 카테고리')
        }),
        func: async ({ query, category }) => {
          return await this.searchDatabase(query, category);
        }
      }),

      // 디자인 원칙 검색 도구
      new DynamicStructuredTool({
        name: 'design_principles_search',
        description: 'UI/UX 디자인 원칙과 JSON 설계 규칙을 검색합니다.',
        schema: z.object({
          principle_type: z.enum(['ui_ux', 'json_design', 'accessibility', 'responsive']).describe('원칙 타입'),
          context: z.string().describe('검색 컨텍스트')
        }),
        func: async ({ principle_type, context }) => {
          return await this.searchDesignPrinciples(principle_type, context);
        }
      }),

      // 기술적 요구사항 분석 도구
      new DynamicStructuredTool({
        name: 'technical_requirements_analysis',
        description: '사용자 요청의 기술적 요구사항을 분석하고 추천 기술 스택을 제안합니다.',
        schema: z.object({
          user_request: z.string().describe('사용자 요청'),
          extracted_metadata: z.string().describe('추출된 메타데이터')
        }),
        func: async ({ user_request, extracted_metadata }) => {
          return await this.analyzeTechnicalRequirements(user_request, extracted_metadata);
        }
      }),

      // 상세 명세 생성 도구
      new DynamicStructuredTool({
        name: 'generate_detailed_specification',
        description: '모든 분석 결과를 바탕으로 개발자가 이해할 수 있는 상세한 JSON 명세를 생성합니다.',
        schema: z.object({
          analysis_results: z.string().describe('분석 결과들'),
          user_intent: z.string().describe('사용자 의도'),
          technical_requirements: z.string().describe('기술적 요구사항')
        }),
        func: async ({ analysis_results, user_intent, technical_requirements }) => {
          return await this.generateDetailedSpecification(analysis_results, user_intent, technical_requirements);
        }
      })
    ];

    return tools;
  }

  // 라우터 체인 생성
  createRouterChain() {
    const routerTemplate = `다음 사용자 요청과 메타데이터를 분석하여 가장 적절한 작업 경로를 결정하세요.

사용자 요청: {user_request}
추출된 메타데이터: {metadata}

가능한 작업 경로:
1. database_search - 데이터베이스에서 관련 UI 패턴이나 컴포넌트를 검색해야 할 때
2. design_principles_search - 디자인 원칙이나 JSON 설계 규칙을 찾아야 할 때
3. technical_requirements_analysis - 기술적 요구사항을 분석해야 할 때
4. generate_detailed_specification - 최종 상세 명세를 생성해야 할 때

가장 적절한 작업을 선택하고 그 이유를 설명하세요.
선택된 작업:`;

    const prompt = PromptTemplate.fromTemplate(routerTemplate);
    
    return RunnableSequence.from([
      {
        user_request: (input) => input.user_request,
        metadata: (input) => input.metadata
      },
      prompt,
      this.llm
    ]);
  }

  // 데이터베이스 검색 구현
  async searchDatabase(query, category) {
    try {
      // 실제 구현에서는 Supabase나 다른 데이터베이스를 사용
      const mockData = {
        ui_patterns: {
          '애니메이션': ['fade-in', 'slide', 'bounce', 'rotate'],
          '인터랙션': ['hover', 'click', 'drag', 'scroll'],
          '레이아웃': ['grid', 'flexbox', 'card', 'sidebar']
        },
        components: {
          '버튼': ['primary', 'secondary', 'ghost', 'icon'],
          '카드': ['simple', 'interactive', 'media', 'stats'],
          '네비게이션': ['header', 'sidebar', 'breadcrumb', 'pagination']
        },
        styles: {
          '색상': ['primary', 'secondary', 'accent', 'neutral'],
          '타이포그래피': ['heading', 'body', 'caption', 'label'],
          '간격': ['xs', 'sm', 'md', 'lg', 'xl']
        }
      };

      const results = mockData[category] || {};
      const relevantResults = Object.entries(results)
        .filter(([key]) => key.includes(query) || query.includes(key))
        .map(([key, values]) => `${key}: ${values.join(', ')}`)
        .join('; ');

      return relevantResults || `카테고리 '${category}'에서 '${query}'와 관련된 정보를 찾을 수 없습니다.`;
    } catch (error) {
      return `데이터베이스 검색 중 오류 발생: ${error.message}`;
    }
  }

  // 디자인 원칙 검색 구현
  async searchDesignPrinciples(principle_type, context) {
    const principles = {
      ui_ux: {
        '일관성': '동일한 기능은 동일한 방식으로 구현하고, 일관된 시각적 언어를 사용하세요.',
        '접근성': '색상 대비, 키보드 네비게이션, 스크린 리더 지원을 고려하세요.',
        '사용자 중심': '사용자의 작업 흐름을 최적화하고 불필요한 복잡성을 제거하세요.',
        '피드백': '사용자 액션에 대한 즉각적이고 명확한 피드백을 제공하세요.'
      },
      json_design: {
        '구조화': '데이터를 논리적으로 그룹화하고 명확한 계층 구조를 만드세요.',
        '확장성': '향후 기능 추가를 고려하여 유연한 구조를 설계하세요.',
        '가독성': '의미있는 키 이름을 사용하고 적절한 들여쓰기를 적용하세요.',
        '타입 안전성': '데이터 타입을 명확히 정의하고 검증 로직을 포함하세요.'
      },
      accessibility: {
        '색상 대비': 'WCAG AA 기준을 만족하는 충분한 색상 대비를 확보하세요.',
        '키보드 네비게이션': '모든 인터랙티브 요소가 키보드로 접근 가능해야 합니다.',
        '스크린 리더': '의미있는 alt 텍스트와 ARIA 라벨을 제공하세요.',
        '포커스 표시': '키보드 포커스가 명확하게 표시되어야 합니다.'
      },
      responsive: {
        '모바일 우선': '작은 화면부터 시작하여 점진적으로 확장하세요.',
        '유연한 그리드': '고정 너비 대신 상대적 단위를 사용하세요.',
        '이미지 최적화': '화면 크기에 맞는 적절한 이미지 크기를 제공하세요.',
        '터치 친화적': '터치 인터페이스를 위한 충분한 크기의 터치 영역을 확보하세요.'
      }
    };

    const relevantPrinciples = principles[principle_type] || {};
    const contextKeywords = context.toLowerCase().split(' ');
    
    const matchedPrinciples = Object.entries(relevantPrinciples)
      .filter(([key, value]) => 
        contextKeywords.some(keyword => 
          key.toLowerCase().includes(keyword) || value.toLowerCase().includes(keyword)
        )
      )
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return matchedPrinciples || `컨텍스트 '${context}'와 관련된 ${principle_type} 원칙을 찾을 수 없습니다.`;
  }

  // 기술적 요구사항 분석 구현
  async analyzeTechnicalRequirements(user_request, extracted_metadata) {
    const analysisPrompt = `사용자 요청: ${user_request}
추출된 메타데이터: ${extracted_metadata}

이 요청을 구현하기 위한 기술적 요구사항을 분석하세요:

1. 필요한 기술 스택
2. 성능 요구사항
3. 호환성 요구사항
4. 보안 고려사항
5. 확장성 요구사항

JSON 형태로 응답하세요.`;

    try {
      const response = await this.llm.invoke(analysisPrompt);
      return response.content;
    } catch (error) {
      return `기술적 요구사항 분석 중 오류 발생: ${error.message}`;
    }
  }

  // 상세 명세 생성 구현
  async generateDetailedSpecification(analysis_results, user_intent, technical_requirements) {
    const specPrompt = `다음 정보를 바탕으로 개발자가 바로 구현할 수 있는 상세한 JSON 명세를 생성하세요:

사용자 의도: ${user_intent}
분석 결과: ${analysis_results}
기술적 요구사항: ${technical_requirements}

다음 구조로 JSON 명세를 생성하세요:
{
  "project": {
    "name": "프로젝트명",
    "description": "프로젝트 설명",
    "version": "1.0.0"
  },
  "requirements": {
    "functional": ["기능적 요구사항들"],
    "non_functional": ["비기능적 요구사항들"]
  },
  "architecture": {
    "components": ["필요한 컴포넌트들"],
    "data_flow": "데이터 흐름 설명",
    "interfaces": ["인터페이스 정의들"]
  },
  "implementation": {
    "technologies": ["사용할 기술들"],
    "dependencies": ["의존성들"],
    "file_structure": "파일 구조"
  },
  "ui_specification": {
    "layout": "레이아웃 정의",
    "components": ["UI 컴포넌트들"],
    "styles": "스타일 정의",
    "interactions": ["인터랙션 정의들"]
  },
  "data_specification": {
    "models": ["데이터 모델들"],
    "api_endpoints": ["API 엔드포인트들"],
    "validation": "데이터 검증 규칙"
  }
}`;

    try {
      const response = await this.llm.invoke(specPrompt);
      return response.content;
    } catch (error) {
      return `상세 명세 생성 중 오류 발생: ${error.message}`;
    }
  }

  // 메인 처리 함수
  async processUserRequest(userRequest, metadata) {
    try {
      console.log('🤖 기획자 AI 에이전트 시작...');
      console.log('사용자 요청:', userRequest);
      console.log('메타데이터:', metadata);

      // 라우터를 통한 작업 경로 결정
      const routingResult = await this.routerChain.invoke({
        user_request: userRequest,
        metadata: JSON.stringify(metadata)
      });

      console.log('📋 라우팅 결과:', routingResult.content);

      // 단순화된 에이전트 실행
      const agentSteps = [];
      let currentAnalysis = '';
      let technicalRequirements = '';

      // 1단계: 데이터베이스 검색
      const dbSearchResult = await this.tools[0].invoke({
        query: userRequest,
        category: 'ui_patterns'
      });
      agentSteps.push({ action: { tool: 'database_search' }, result: dbSearchResult });
      currentAnalysis += `데이터베이스 검색 결과: ${dbSearchResult}\n`;

      // 2단계: 디자인 원칙 검색
      const designResult = await this.tools[1].invoke({
        principle_type: 'ui_ux',
        context: userRequest
      });
      agentSteps.push({ action: { tool: 'design_principles_search' }, result: designResult });
      currentAnalysis += `디자인 원칙: ${designResult}\n`;

      // 3단계: 기술적 요구사항 분석
      technicalRequirements = await this.tools[2].invoke({
        user_request: userRequest,
        extracted_metadata: JSON.stringify(metadata)
      });
      agentSteps.push({ action: { tool: 'technical_requirements_analysis' }, result: technicalRequirements });

      // 4단계: 상세 명세 생성
      const detailedSpec = await this.tools[3].invoke({
        analysis_results: currentAnalysis,
        user_intent: userRequest,
        technical_requirements: technicalRequirements
      });
      agentSteps.push({ action: { tool: 'generate_detailed_specification' }, result: detailedSpec });

      console.log('✅ 에이전트 실행 완료');
      return {
        success: true,
        data: {
          routing_decision: routingResult.content,
          detailed_specification: detailedSpec,
          agent_steps: agentSteps
        }
      };

    } catch (error) {
      console.error('❌ 에이전트 실행 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 테스트 함수
async function testPlannerAgent() {
  const agent = new PlannerAgent();
  
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

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n=== 테스트 케이스 ${i + 1} ===`);
    console.log('사용자 요청:', testCase.userRequest);
    
    const result = await agent.processUserRequest(testCase.userRequest, testCase.metadata);
    
    if (result.success) {
      console.log('✅ 성공');
      console.log('라우팅 결정:', result.data.routing_decision);
      console.log('상세 명세:', result.data.detailed_specification);
    } else {
      console.log('❌ 실패:', result.error);
    }
  }
}

// 모듈 내보내기
export { PlannerAgent, testPlannerAgent };

// 직접 실행 시 테스트
if (import.meta.url === `file://${process.argv[1]}`) {
  testPlannerAgent().catch(console.error);
}
