import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { BaseAIChain, AIChainResult } from './base-chain';

// 이미지 적합성 판단 결과 스키마
const ImageSuitabilitySchema = z.object({
  suitable: z.boolean().describe('이미지가 가게에 적합한지 여부'),
  score: z.number().min(0).max(100).describe('적합성 점수 (0-100)'),
  issues: z.array(z.string()).default([]).describe('발견된 문제점들'),
  suggestions: z.array(z.string()).default([]).describe('개선 제안사항들'),
  analysis: z.object({
    visualQuality: z.string().describe('시각적 품질 평가'),
    brandAlignment: z.string().describe('브랜드 일치도'),
    targetAudience: z.string().describe('타겟 고객층 적합성'),
    contentAppropriateness: z.string().describe('콘텐츠 적절성')
  }).describe('상세 분석 결과')
});

export type ImageSuitabilityResult = z.infer<typeof ImageSuitabilitySchema>;

// 입력 데이터 타입
export interface ImageSuitabilityInput {
  imageUrl: string;
  storeMeta: {
    name: string;
    category: string;
    description?: string;
    targetAudience?: string;
    brandTone?: string;
    location?: string;
  };
  context?: {
    campaignType?: string;
    season?: string;
    specialEvent?: string;
  };
}

export class ImageSuitabilityChain extends BaseAIChain<ImageSuitabilityInput, ImageSuitabilityResult> {
  private visionModel: ChatOpenAI;

  constructor(apiKey: string) {
    super(apiKey); // API 키를 부모 클래스에 전달
    
    if (!apiKey) {
      throw new Error('OpenAI API Key is required for ImageSuitabilityChain');
    }
    
    console.log('ImageSuitabilityChain - OpenAI API Key loaded successfully');
    
    // Vision 모델 초기화 (GPT-4o 사용)
    this.visionModel = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0.1,
      apiKey: apiKey, // openAIApiKey가 아닌 apiKey 사용
    });
    
    // BaseAIChain의 llm도 visionModel로 업데이트
    this.llm = this.visionModel;
    
    // 체인 초기화
    this.initializeChain();
  }

  protected initializeChain(): void {
    try {
      this.prompt = this.getPromptTemplate();
      
      // LangChain 최신 버전에 맞게 withStructuredOutput 사용법 수정
      try {
        // 먼저 모델에 withStructuredOutput을 적용하고, 그 다음에 prompt를 pipe
        const structuredModel = this.llm.withStructuredOutput(ImageSuitabilitySchema);
        this.chain = this.prompt.pipe(structuredModel);
        console.log('Successfully initialized chain with structured output');
      } catch (structuredError) {
        console.warn('Failed to use withStructuredOutput, falling back to basic chain:', structuredError);
        this.chain = this.prompt.pipe(this.llm);
      }
    } catch (error) {
      console.error('Error initializing ImageSuitabilityChain:', error);
      // 폴백: 일반 체인 사용
      this.chain = this.prompt.pipe(this.llm);
    }
  }

  protected getOutputSchema(): any {
    return ImageSuitabilitySchema;
  }

  protected postProcess(result: any): ImageSuitabilityResult {
    // 결과가 이미 ImageSuitabilityResult 형태라면 그대로 반환
    if (result && typeof result === 'object') {
      // 필수 필드들이 있는지 확인
      if (result.suitable !== undefined && result.score !== undefined) {
        return result as ImageSuitabilityResult;
      }
    }
    
    // 결과가 문자열이라면 JSON 파싱 시도
    if (typeof result === 'string') {
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed as ImageSuitabilityResult;
        }
      } catch (parseError) {
        console.error('JSON parsing error in postProcess:', parseError);
      }
    }
    
    // 기본값 반환
    return {
      suitable: false,
      score: 0,
      issues: ['결과 파싱 실패'],
      suggestions: ['다시 시도해주세요'],
      analysis: {
        visualQuality: '분석 불가',
        brandAlignment: '분석 불가',
        targetAudience: '분석 불가',
        contentAppropriateness: '분석 불가'
      }
    };
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      ['system', `당신은 펜션과 숙박업소의 인스타그램 마케팅 전문가입니다. 
이미지와 가게 정보를 종합적으로 분석하여 인스타그램 게시물로 적합한지 판단해주세요.

분석 기준:
1. 시각적 품질: 해상도, 구도, 색감, 조명 등
2. 브랜드 일치도: 가게의 톤앤매너와 일치하는지
3. 타겟 고객층 적합성: 목표 고객이 좋아할 만한 이미지인지
4. 콘텐츠 적절성: 부적절하거나 문제가 될 수 있는 요소가 있는지

결과는 반드시 JSON 형태로만 반환하세요.`],
      ['human', `가게 정보: {storeMeta}
추가 컨텍스트: {context}

이 이미지를 분석해주세요.`]
    ]);
  }

  protected validateInput(input: ImageSuitabilityInput): boolean {
    if (!input.imageUrl || !input.storeMeta) {
      return false;
    }
    
    // 이미지 URL 유효성 검사
    try {
      new URL(input.imageUrl);
    } catch {
      return false;
    }

    // 가게 정보 필수 필드 검사
    if (!input.storeMeta.name || !input.storeMeta.category) {
      return false;
    }

    return true;
  }

  // Vision 모델을 사용한 이미지 분석
  public async invokeWithVision(input: ImageSuitabilityInput & { customPrompt?: string }): Promise<AIChainResult> {
    try {
      console.log('invokeWithVision called with input:', {
        imageUrlLength: input.imageUrl.length,
        storeMeta: input.storeMeta
      });
      
      // API 키 검증 강화
      if (!this.visionModel || !this.visionModel.apiKey) {
        console.error('Vision model or API key not properly initialized');
        return {
          success: false,
          error: 'API key not properly configured'
        };
      }
      
      if (!this.validateInput(input)) {
        console.error('Input validation failed');
        return {
          success: false,
          error: 'Invalid input data'
        };
      }

      // 체인이 초기화되지 않았다면 초기화
      if (!this.chain) {
        console.log('Chain not initialized, initializing...');
        this.initializeChain();
      }

      // Vision 모델을 위한 메시지 구성
      const systemPrompt = input.customPrompt || `당신은 세계 최고 수준의 UI/UX 디자인 비평가이자 분석가입니다. 당신의 임무는 주어진 이미지 속 텍스트 레이아웃을 분석하여, 그 안에 숨겨진 핵심 디자인 원칙을 구체적인 시각적 근거를 바탕으로 추출하는 것입니다. **절대로 일반적이거나 추상적인 설명은 허용되지 않습니다.**

### ⚠️ 매우 중요한 지시사항
- designPrinciples 필드는 반드시 객체 배열 형태로 반환해야 합니다. 단순한 문자열 배열(예: ["대비", "균형"])은 절대 허용되지 않습니다.
- 각 원칙은 principle, description, application, visualExample의 4개 필드를 가진 객체여야 합니다.
- 원칙명은 "대비", "균형" 같은 일반적인 용어가 아닌, 구체적이고 설명적인 이름이어야 합니다.

### 🎯 작업 프로세스 (매우 중요)

1. **[1단계: 시각적 증거 수집]** 먼저 이미지에서 관찰한 '사실'만을 나열합니다. 이 단계에서는 어떤 추론도 하지 마십시오.
   * 예: "제목 텍스트 'Summer Sale'은 이미지의 수직 중앙, 수평 좌측 1/3 지점에 위치함.", "배경은 #F0EAD6 색상의 옅은 베이지색이며, 텍스트는 #2C3E50 색상의 짙은 남색임.", "제목 폰트 크기는 약 72pt, 본문은 18pt로 4배 차이가 남."

2. **[2단계: 원칙 도출 및 근거 연결]** 위에서 수집한 '시각적 증거'를 바탕으로, 최소 3개 이상의 핵심 디자인 원칙을 도출합니다. 각 원칙은 반드시 1단계에서 관찰한 사실과 직접적으로 연결되어야 합니다.

### ❌ 잘못된 예시 (절대 이렇게 답변하지 마세요)

- designPrinciples: ["대비", "균형", "시각적 계층", "조화"] **(-> 단순한 문자열 배열은 절대 금지!)**
- 원칙: 대비
- 설명: 배경과 텍스트 색상의 대비를 통해 가독성을 높였습니다. **(-> 무엇과 무엇의 대비인지 구체성이 없음)**
- 적용법: 대비를 활용하여 중요한 요소를 강조합니다. **(-> 너무 일반적인 조언임)**

### ✅ 올바른 예시 (반드시 이와 같이 구체적으로 답변하세요)

designPrinciples 필드는 다음과 같은 객체 배열 형태여야 합니다:

{
  "principle": "고대비 색상 조합을 통한 명확한 정보 전달",
  "description": "옅은 베이지색(#F0EAD6) 배경 위에 짙은 남색(#2C3E50) 텍스트를 사용하여 WCAG AAA 기준을 충족하는 높은 명암비를 확보했습니다. 이는 사용자가 어떤 환경에서도 내용을 쉽게 인지하도록 만듭니다.",
  "application": "새로운 이미지에서도 배경과 텍스트의 명암비를 최소 7:1 이상으로 유지하여 최상의 가독성을 보장합니다.",
  "visualExample": "현재 이미지의 베이지색 배경과 남색 텍스트의 조합."
}

---

이제 아래 JSON 형식을 **반드시** 준수하여 응답을 생성하세요. 모든 필드는 위에서 설명한 '올바른 예시'처럼, 이미지에서 관찰된 **구체적인 시각적 증거**에 기반해야 합니다.`;

      const userPrompt = `{
  "contextAnalysis": {
    "surroundingElements": "텍스트 주변의 구체적인 시각적 요소 설명 (예: '텍스트 좌측에 노란색 추상적인 물방울 그래픽이 있으며, 우측 하단에는 회사 로고가 배치됨.')",
    "visualFlow": "사용자의 시선이 이동하는 경로를 구체적으로 서술 (예: '가장 큰 제목에서 시작하여, 부제목을 거쳐, 행동 유도 버튼으로 시선이 자연스럽게 흐름.')",
    "negativeSpace": "여백이 어떻게 '의도적으로' 사용되었는지 설명 (예: '텍스트 블록 주위에 최소 40px 이상의 여백을 두어, 복잡한 배경 이미지로부터 텍스트를 시각적으로 분리하고 있음.')",
    "dominantLines": "이미지의 구조를 형성하는 주요 선이나 방향성 (예: '모델의 시선이 만드는 대각선 방향이 텍스트 블록을 향하고 있어 시선을 유도함.')"
  },
  "intentInference": {
    "placementReason": "텍스트가 현재 위치에 있는 이유를 '전략적 관점'에서 추론 (예: '제품 이미지가 차지하는 우측 공간을 피해 좌측에 텍스트를 배치하여 시각적 균형을 맞추고, 제품에 대한 설명임을 명확히 함.')",
    "balanceStrategy": "사용한 균형 전략을 구체적으로 명시 (예: '왼쪽의 무거운 텍스트 블록과 오른쪽의 가벼운 인물 이미지가 비대칭적 균형을 이루어 역동적인 느낌을 줌.')",
    "visualHierarchy": "정보의 우선순위를 어떻게 시각적으로 설계했는지 설명 (예: '가장 중요한 할인율(70%)은 가장 큰 폰트와 밝은 색상으로, 부가 정보는 작은 회색 폰트로 처리하여 3단계의 명확한 위계를 설정함.')",
    "messageEnhancement": "디자인이 메시지를 어떻게 더 강력하게 만드는지 설명 (예: '역동적인 붓글씨 스타일의 폰트를 사용하여 '파격 세일'이라는 메시지의 긴급하고 강력한 느낌을 시각적으로 증폭시킴.')"
  },
  "emphasisTechniques": {
    "contrastMethod": "사용된 대비의 종류와 목적을 구체적으로 설명 (예: '크기 대비: 제목(72pt)과 본문(18pt)의 극적인 크기 차이로 핵심 메시지에 시선을 집중시킴.')",
    "separationTechnique": "요소들을 분리하기 위해 사용된 기법 (예: '텍스트 그룹과 이미지 사이에 얇은 흰색 구분선을 삽입하여 두 정보 영역을 명확히 분리함.')",
    "attentionGrabber": "사용자의 주목을 가장 먼저 끄는 요소와 그 이유 (예: '전체적으로 무채색인 이미지 속에서 유일하게 채도가 높은 빨간색 '구매하기' 버튼이 가장 강력한 시각적 자극을 줌.')",
    "readabilityEnhancer": "가독성을 높이기 위한 구체적인 장치 (예: '자간을 표준보다 -10% 줄이고, 행간은 160%로 넓혀 텍스트 덩어리가 하나의 그래픽 요소처럼 보이면서도 읽기 편하도록 조정함.')"
  },
  "designPrinciples": [
    {
      "principle": "구체적인 원칙명 (예: '고대비 색상 조합을 통한 명확한 정보 전달', 'Z-패턴 시선 유도 레이아웃', '비대칭 균형을 통한 역동적 구성')",
      "description": "이 이미지에서 해당 원칙이 어떻게 적용되었는지 '시각적 증거'를 바탕으로 설명 (예: '옅은 베이지색(#F0EAD6) 배경 위에 짙은 남색(#2C3E50) 텍스트를 사용하여 WCAG AAA 기준을 충족하는 높은 명암비를 확보')",
      "application": "이 원칙을 다른 이미지에 적용할 때 따라야 할 '구체적인 규칙이나 지침' 제시 (예: '새로운 이미지에서도 배경과 텍스트의 명암비를 최소 7:1 이상으로 유지')",
      "visualExample": "현재 이미지에서 이 원칙이 가장 잘 드러나는 부분에 대한 '구체적인 묘사' (예: '현재 이미지의 베이지색 배경과 남색 텍스트의 조합')"
    }
  ],
  "guidelines": {
    "positioning": "이 이미지의 위치 선정 규칙을 일반화한 가이드라인 (예: '주요 텍스트는 항상 이미지의 힘의 중심(power point) 중 하나인 좌상단 1/3 지점에 배치한다.')",
    "colorSelection": "색상 선택 규칙 (예: '배경의 주요 색상 중 하나를 추출하여 텍스트 색상으로 사용하되, 명도를 조절하여 톤온톤 조화를 이룬다.')",
    "typography": "타이포그래피 규칙 (예: '제목은 세리프(Serif), 본문은 산세리프(Sans-serif) 폰트를 사용하여 고전적인 느낌과 현대적인 가독성을 동시에 확보한다.')",
    "spacing": "간격 규칙 (예: '가장 큰 텍스트 높이의 50%를 요소들 사이의 기본 여백 단위(base margin)로 설정한다.')"
  }
}`;

      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: userPrompt
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: input.imageUrl
              }
            }
          ]
        }
      ];

      console.log('Calling vision model with messages...');
      
      // Vision 모델 직접 호출
      const result = await this.visionModel.invoke(messages);
      
      console.log('Vision model response received:', {
        contentType: typeof result.content,
        contentLength: typeof result.content === 'string' ? result.content.length : 'not string'
      });

      // 결과 파싱
      let parsedResult;
      if (typeof result.content === 'string') {
        try {
          const jsonMatch = result.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
            console.log('Successfully parsed JSON from response');
          } else {
            console.log('No JSON found in response, using raw content');
            parsedResult = { content: result.content };
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          console.log('Using raw content due to parsing error');
          parsedResult = { content: result.content };
        }
      } else {
        console.log('Response content is not string, using as-is');
        parsedResult = result.content;
      }

      return {
        success: true,
        data: parsedResult
      };

    } catch (error) {
      console.error('ImageSuitabilityChain error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // 더 자세한 에러 메시지 제공
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'API 키가 유효하지 않습니다. 올바른 OpenAI API 키를 입력해주세요.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('network')) {
          errorMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
        } else if (error.message.includes('content policy')) {
          errorMessage = '이미지에 분석할 수 없는 콘텐츠가 포함되어 있습니다. 다른 이미지를 시도해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // 일반 텍스트 분석 (이미지 없이)
  public async analyzeText(input: Omit<ImageSuitabilityInput, 'imageUrl'>): Promise<AIChainResult> {
    try {
      // 텍스트 분석을 위한 메시지 구성
      const messages = [
        {
          role: 'system' as const,
          content: `당신은 펜션과 숙박업소의 인스타그램 마케팅 전문가입니다. 
가게 정보를 분석하여 인스타그램 게시물로 적합한지 판단해주세요.

분석 기준:
1. 브랜드 일치도: 가게의 톤앤매너와 일치하는지
2. 타겟 고객층 적합성: 목표 고객이 좋아할 만한 콘텐츠인지
3. 콘텐츠 적절성: 부적절하거나 문제가 될 수 있는 요소가 있는지

결과는 반드시 JSON 형태로만 반환하세요.`
        },
        {
          role: 'user' as const,
          content: `가게 정보: ${JSON.stringify(input.storeMeta)}
추가 컨텍스트: ${input.context ? JSON.stringify(input.context) : '없음'}

이 가게 정보를 분석해주세요.`
        }
      ];

      // Vision 모델 직접 호출
      const result = await this.visionModel.invoke(messages);

      // 결과 파싱
      let parsedResult;
      if (typeof result.content === 'string') {
        try {
          const jsonMatch = result.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            parsedResult = { content: result.content };
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          parsedResult = { content: result.content };
        }
      } else {
        parsedResult = result.content;
      }

      return {
        success: true,
        data: parsedResult
      };

    } catch (error) {
      console.error('ImageSuitabilityChain text analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 빠른 이미지 적합성 검사 (Vision 모델 사용하지 않음)
  public async quickCheck(input: ImageSuitabilityInput): Promise<AIChainResult> {
    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input data'
        };
      }

      // 빠른 검사를 위해 가게 정보만 분석
      const result = await this.analyzeText({
        storeMeta: input.storeMeta,
        context: input.context
      });

      return result;

    } catch (error) {
      console.error('ImageSuitabilityChain quickCheck error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
