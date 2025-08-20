import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseAIChain, AIChainResult } from './base-chain';
import { z } from 'zod';

// 입력 타입
export interface UserIntentAnalysisInput {
  userRequest: string;
  context?: {
    storeProfile?: any;
    previousInteractions?: any[];
    userPreferences?: any;
  };
}

// 출력 스키마 정의
export const UserIntentAnalysisSchema = z.object({
  coreObjective: z.string().describe("사용자의 핵심 목표나 원하는 결과"),
  primaryFunction: z.string().describe("주요 기능이나 작업 유형"),
  keyData: z.array(z.string()).describe("추출된 주요 데이터나 정보"),
  visualElements: z.object({
    colors: z.array(z.string()).optional().describe("언급된 색상들"),
    shapes: z.array(z.string()).optional().describe("언급된 도형들"),
    animations: z.array(z.string()).optional().describe("언급된 애니메이션들"),
    layouts: z.array(z.string()).optional().describe("언급된 레이아웃들"),
    images: z.array(z.string()).optional().describe("언급된 이미지 관련 요소들")
  }).optional(),
  technicalRequirements: z.object({
    canvasType: z.enum(['animation', 'static', 'interactive', 'data-visualization']).optional(),
    complexity: z.enum(['simple', 'medium', 'complex']).optional(),
    performance: z.enum(['low', 'medium', 'high']).optional(),
    responsive: z.boolean().optional(),
    accessibility: z.boolean().optional()
  }).optional(),
  contentRequirements: z.object({
    textContent: z.array(z.string()).optional(),
    dataSources: z.array(z.string()).optional(),
    externalAPIs: z.array(z.string()).optional(),
    branding: z.object({
      logo: z.boolean().optional(),
      colors: z.array(z.string()).optional(),
      fonts: z.array(z.string()).optional()
    }).optional()
  }).optional(),
  constraints: z.array(z.string()).optional().describe("제약사항이나 특별한 요구사항"),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  estimatedEffort: z.enum(['quick', 'moderate', 'extensive']).optional(),
  confidence: z.number().min(0).max(1).describe("분석 결과의 신뢰도")
});

export type UserIntentAnalysisOutput = z.infer<typeof UserIntentAnalysisSchema>;

export class UserIntentAnalysisChain extends BaseAIChain<UserIntentAnalysisInput, UserIntentAnalysisOutput> {
  constructor(apiKey: string) {
    console.log('UserIntentAnalysisChain constructor called with apiKey:', !!apiKey);
    super(apiKey);
    console.log('UserIntentAnalysisChain super() called');
    this.initializeChain();
    console.log('UserIntentAnalysisChain initialization completed');
  }

  protected initializeChain(): void {
    this.prompt = this.getPromptTemplate();
    this.chain = this.prompt.pipe(this.llm);
  }

  protected getOutputSchema(): any {
    return UserIntentAnalysisSchema;
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromTemplate(`
당신은 사용자 요청을 분석하여 Canvas API 코드 생성에 필요한 구조화된 메타데이터를 추출하는 전문가입니다.

사용자 요청: {userRequest}
컨텍스트: {context}

다음 사항들을 분석하여 JSON 형태로 응답해주세요:

1. **핵심 목표 (coreObjective)**: 사용자가 달성하고자 하는 주요 목표
2. **주요 기능 (primaryFunction)**: 구현해야 할 주요 기능이나 작업 유형
3. **주요 데이터 (keyData)**: 추출된 중요한 데이터나 정보들
4. **시각적 요소 (visualElements)**:
   - colors: 언급된 색상들
   - shapes: 언급된 도형들  
   - animations: 언급된 애니메이션들
   - layouts: 언급된 레이아웃들
   - images: 언급된 이미지 관련 요소들
5. **기술적 요구사항 (technicalRequirements)**:
   - canvasType: "animation" | "static" | "interactive" | "data-visualization"
   - complexity: "simple" | "medium" | "complex"
   - performance: "low" | "medium" | "high"
   - responsive: 반응형 여부
   - accessibility: 접근성 고려 여부
6. **콘텐츠 요구사항 (contentRequirements)**:
   - textContent: 텍스트 콘텐츠들
   - dataSources: 데이터 소스들
   - externalAPIs: 외부 API들
   - branding: 브랜딩 관련 요소들
7. **제약사항 (constraints)**: 특별한 제약이나 요구사항들
8. **우선순위 (priority)**: "low" | "medium" | "high" | "urgent"
9. **예상 작업량 (estimatedEffort)**: "quick" | "moderate" | "extensive"
10. **신뢰도 (confidence)**: 0.0 ~ 1.0 사이의 값

응답은 반드시 유효한 JSON 형태여야 하며, 언급되지 않은 항목은 null이나 빈 배열로 처리해주세요.

예시 응답:
{
  "coreObjective": "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션 생성",
  "primaryFunction": "animation",
  "keyData": ["빨간색", "원", "왼쪽에서 오른쪽", "움직임"],
  "visualElements": {
    "colors": ["빨간색"],
    "shapes": ["원"],
    "animations": ["왼쪽에서 오른쪽으로 움직임"]
  },
  "technicalRequirements": {
    "canvasType": "animation",
    "complexity": "simple",
    "performance": "medium"
  },
  "constraints": [],
  "priority": "medium",
  "estimatedEffort": "quick",
  "confidence": 0.95
}
`);
  }

  protected validateInput(input: UserIntentAnalysisInput): boolean {
    return !!(input.userRequest && input.userRequest.trim().length > 0);
  }

  protected postProcess(result: any): UserIntentAnalysisOutput {
    try {
      let parsed;
      if (typeof result === 'string') {
        // JSON 문자열에서 불필요한 문자 제거
        const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } else {
        parsed = result;
      }

      // 스키마 검증
      const validated = UserIntentAnalysisSchema.parse(parsed);
      return validated;
    } catch (error) {
      console.error('Error parsing user intent analysis result:', error);
      // 기본값 반환
      return {
        coreObjective: '',
        primaryFunction: '',
        keyData: [],
        confidence: 0.5
      };
    }
  }

  // 사용자 의도 분석 메서드
  public async analyzeUserIntent(input: UserIntentAnalysisInput): Promise<AIChainResult<UserIntentAnalysisOutput>> {
    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input data'
        };
      }

      const result = await this.invoke(input);
      return result;
    } catch (error) {
      console.error('UserIntentAnalysisChain analyzeUserIntent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
