// import { BaseModel, Field } from 'pydantic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseAIChain, AIChainResult } from './base-chain';
import { IntentParsingChain, type IntentParsingInput } from './intent-parsing';

// 입력 타입
export interface CaptionGenerationInput {
  storeSlug: string;
  imageDescription: string;
  userIntent?: string;
  stylePreferences?: string;
  targetAudience?: string;
  platform?: string;
}

// 출력 타입
export interface CaptionGenerationOutput {
  caption: string;
  hashtags: string[];
  tone: string;
  keywords: string[];
  confidence: number;
}

// Pydantic 모델 (임시 주석 처리)
// export class CaptionGenerationSchema extends BaseModel {
//   @Field()
//   caption: string;

//   @Field()
//   hashtags: string[];

//   @Field()
//   tone: string;

//   @Field()
//   keywords: string[];

//   @Field()
//   confidence: number;
// }

export class CaptionGenerationChain extends BaseAIChain<CaptionGenerationInput, CaptionGenerationOutput> {
  private intentParser: IntentParsingChain;

  constructor() {
    super();
    this.intentParser = new IntentParsingChain();
  }

  protected initializeChain(): void {
    this.prompt = this.getPromptTemplate();
    this.chain = this.prompt.pipe(this.llm);
  }

  protected getOutputSchema(): any {
    // return CaptionGenerationSchema;
    return null;
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromTemplate(`
      당신은 소셜미디어 캡션 생성 전문가입니다.
      
      가게 정보: {storeSlug}
      이미지 설명: {imageDescription}
      사용자 의도: {userIntent}
      스타일 선호도: {stylePreferences}
      타겟 오디언스: {targetAudience}
      플랫폼: {platform}
      
      다음 요구사항에 따라 캡션을 생성해주세요:
      1. 브랜드 톤앤매너에 맞는 캡션
      2. 타겟 오디언스에게 어필하는 내용
      3. 플랫폼 특성에 맞는 형식
      4. 해시태그 포함
      5. 자연스럽고 매력적인 문체
      
      JSON 형태로 응답해주세요:
      {{
        "caption": "캡션 내용",
        "hashtags": ["해시태그1", "해시태그2"],
        "tone": "톤앤매너",
        "keywords": ["키워드1", "키워드2"],
        "confidence": 0.95
      }}
    `);
  }

  protected validateInput(input: CaptionGenerationInput): boolean {
    return !!(input.storeSlug && input.imageDescription);
  }

  protected postProcess(result: any): CaptionGenerationOutput {
    try {
      // JSON 파싱 시도
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        caption: parsed.caption || '',
        hashtags: parsed.hashtags || [],
        tone: parsed.tone || '',
        keywords: parsed.keywords || [],
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Error parsing caption generation result:', error);
      return {
        caption: '캡션 생성 중 오류가 발생했습니다.',
        hashtags: [],
        tone: '',
        keywords: [],
        confidence: 0
      };
    }
  }

  public async generateCaption(input: CaptionGenerationInput): Promise<AIChainResult<CaptionGenerationOutput>> {
    // 의도 파싱 (선택적) - 임시 주석 처리
    // if (input.userIntent) {
    //   const intentResult = await this.intentParser.invoke({
    //     text: input.userIntent,
    //     context: input.imageDescription
    //   });
      
    //   if (intentResult.success && intentResult.data) {
    //     input = { ...input, userIntent: intentResult.data.intent };
    //   }
    // }

    return this.invoke(input);
  }
}
