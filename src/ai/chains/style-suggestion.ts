import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseAIChain, AIChainResult } from './base-chain';

// 입력 타입
export interface StyleSuggestionInput {
  storeSlug: string;
  currentStyle?: string;
  targetAudience?: string;
}

// 출력 타입
export interface StyleSuggestionOutput {
  suggestedStyle: string;
  reasoning: string;
  examples: string[];
  confidence: number;
}

export class StyleSuggestionChain extends BaseAIChain<StyleSuggestionInput, StyleSuggestionOutput> {
  protected initializeChain(): void {
    this.prompt = this.getPromptTemplate();
    this.chain = this.prompt.pipe(this.llm);
  }

  protected getOutputSchema(): any {
    return null; // TypeScript 인터페이스 사용으로 스키마 불필요
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromTemplate(`
      당신은 스타일 제안 전문가입니다.
      
      가게 정보: {storeSlug}
      현재 스타일: {currentStyle}
      타겟 오디언스: {targetAudience}
      
      다음 항목을 제안해주세요:
      1. 추천 스타일
      2. 제안 이유
      3. 예시 문구들
      
      JSON 형태로 응답해주세요:
      {{
        "suggestedStyle": "추천 스타일",
        "reasoning": "제안 이유",
        "examples": ["예시1", "예시2"],
        "confidence": 0.95
      }}
    `);
  }

  protected validateInput(input: StyleSuggestionInput): boolean {
    return !!(input.storeSlug && input.storeSlug.trim().length > 0);
  }

  protected postProcess(result: any): StyleSuggestionOutput {
    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        suggestedStyle: parsed.suggestedStyle || '',
        reasoning: parsed.reasoning || '',
        examples: parsed.examples || [],
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Error parsing style suggestion result:', error);
      return {
        suggestedStyle: '',
        reasoning: '',
        examples: [],
        confidence: 0
      };
    }
  }

  // 스타일 제안 메서드
  public async suggestStyle(input: StyleSuggestionInput): Promise<AIChainResult> {
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
      console.error('StyleSuggestionChain suggestStyle error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
