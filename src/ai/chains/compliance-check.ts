// import { BaseModel, Field } from 'pydantic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseAIChain, AIChainResult } from './base-chain';

// 입력 타입
export interface ComplianceCheckInput {
  text: string;
  storePolicy?: {
    forbiddenWords?: string[];
    requiredWords?: string[];
    brandNames?: string[];
  };
}

// 출력 타입
export interface ComplianceCheckOutput {
  isCompliant: boolean;
  violations: string[];
  suggestions: string[];
  confidence: number;
}

// Pydantic 모델 (임시 주석 처리)
// export class ComplianceCheckSchema extends BaseModel {
//   @Field()
//   isCompliant: boolean;

//   @Field()
//   violations: string[];

//   @Field()
//   suggestions: string[];

//   @Field()
//   confidence: number;
// }

export class ComplianceCheckChain extends BaseAIChain<ComplianceCheckInput, ComplianceCheckOutput> {
  protected initializeChain(): void {
    this.prompt = this.getPromptTemplate();
    this.chain = this.prompt.pipe(this.llm);
  }

  protected getOutputSchema(): any {
    // return ComplianceCheckSchema;
    return null;
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromTemplate(`
      당신은 콘텐츠 규정 준수 검사 전문가입니다.
      
      검사할 텍스트: {text}
      가게 정책: {storePolicy}
      
      다음 기준으로 규정 준수를 검사해주세요:
      1. 금지어 사용 여부
      2. 필수어 포함 여부
      3. 브랜드명 사용 적절성
      4. 일반적인 소셜미디어 가이드라인 준수
      
      JSON 형태로 응답해주세요:
      {{
        "isCompliant": true,
        "violations": ["위반사항1", "위반사항2"],
        "suggestions": ["개선제안1", "개선제안2"],
        "confidence": 0.95
      }}
    `);
  }

  protected validateInput(input: ComplianceCheckInput): boolean {
    return !!(input.text && input.text.trim().length > 0);
  }

  protected postProcess(result: any): ComplianceCheckOutput {
    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        isCompliant: parsed.isCompliant || false,
        violations: parsed.violations || [],
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Error parsing compliance check result:', error);
      return {
        isCompliant: false,
        violations: ['결과 파싱 오류'],
        suggestions: ['다시 시도해주세요'],
        confidence: 0
      };
    }
  }

  // 규정 준수 검사 메서드
  public async checkCompliance(input: ComplianceCheckInput): Promise<AIChainResult> {
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
      console.error('ComplianceCheckChain checkCompliance error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 빠른 규정 준수 검사 (로컬 검사)
  public quickCheck(content: string, forbiddenWords: string[] = []): {
    compliant: boolean;
    foundWords: string[];
  } {
    const foundWords = forbiddenWords.filter(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
    
    return {
      compliant: foundWords.length === 0,
      foundWords
    };
  }
}
