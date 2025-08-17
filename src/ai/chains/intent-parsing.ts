// import { BaseModel, Field } from 'pydantic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseAIChain, AIChainResult } from './base-chain';

// 입력 타입
export interface IntentParsingInput {
  text: string;
  context?: string;
}

// 출력 타입
export interface IntentParsingOutput {
  intent: string;
  entities: string[];
  confidence: number;
}

// Pydantic 모델 (임시 주석 처리)
// export class IntentParsingSchema extends BaseModel {
//   @Field()
//   intent: string;

//   @Field()
//   entities: string[];

//   @Field()
//   confidence: number;
// }

export class IntentParsingChain extends BaseAIChain<IntentParsingInput, IntentParsingOutput> {
  protected initializeChain(): void {
    this.prompt = this.getPromptTemplate();
    this.chain = this.prompt.pipe(this.llm);
  }

  protected getOutputSchema(): any {
    // return IntentParsingSchema;
    return null;
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromTemplate(`
      당신은 사용자 의도 파싱 전문가입니다.
      
      분석할 텍스트: {text}
      컨텍스트: {context}
      
      다음 항목을 분석해주세요:
      1. 사용자의 주요 의도
      2. 언급된 엔티티들
      
      JSON 형태로 응답해주세요:
      {{
        "intent": "의도",
        "entities": ["엔티티1", "엔티티2"],
        "confidence": 0.95
      }}
    `);
  }

  protected validateInput(input: IntentParsingInput): boolean {
    return !!(input.text && input.text.trim().length > 0);
  }

  protected postProcess(result: any): IntentParsingOutput {
    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        intent: parsed.intent || '',
        entities: parsed.entities || [],
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Error parsing intent parsing result:', error);
      return {
        intent: '',
        entities: [],
        confidence: 0
      };
    }
  }

  // 의도 파싱 메서드
  public async parseIntent(input: IntentParsingInput): Promise<AIChainResult> {
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
      console.error('IntentParsingChain parseIntent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
