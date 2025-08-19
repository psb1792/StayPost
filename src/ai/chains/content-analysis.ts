// import { BaseModel, Field } from 'pydantic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseAIChain, AIChainResult } from './base-chain';

// 입력 타입
export interface ContentAnalysisInput {
  text: string;
  context?: string;
}

// 출력 타입
export interface ContentAnalysisOutput {
  sentiment: string;
  tone: string;
  keywords: string[];
  topics: string[];
  confidence: number;
}

// Pydantic 모델 (임시 주석 처리)
// export class ContentAnalysisSchema extends BaseModel {
//   @Field()
//   sentiment: string;

//   @Field()
//   tone: string;

//   @Field()
//   keywords: string[];

//   @Field()
//   topics: string[];

//   @Field()
//   confidence: number;
// }

export class ContentAnalysisChain extends BaseAIChain<ContentAnalysisInput, ContentAnalysisOutput> {
  constructor(apiKey: string) {
    super(apiKey);
    this.initializeChain();
  }

  protected initializeChain(): void {
    this.prompt = this.getPromptTemplate();
    this.chain = this.prompt.pipe(this.llm);
  }

  protected getOutputSchema(): any {
    // return ContentAnalysisSchema;
    return null;
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromTemplate(`
      당신은 콘텐츠 분석 전문가입니다.
      
      분석할 텍스트: {text}
      컨텍스트: {context}
      
      다음 항목을 분석해주세요:
      1. 감정 (긍정/부정/중립)
      2. 톤앤매너
      3. 주요 키워드
      4. 주제
      
      JSON 형태로 응답해주세요:
      {{
        "sentiment": "긍정",
        "tone": "친근함",
        "keywords": ["키워드1", "키워드2"],
        "topics": ["주제1", "주제2"],
        "confidence": 0.95
      }}
    `);
  }

  protected validateInput(input: ContentAnalysisInput): boolean {
    return !!(input.text && input.text.trim().length > 0);
  }

  protected postProcess(result: any): ContentAnalysisOutput {
    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        sentiment: parsed.sentiment || '중립',
        tone: parsed.tone || '',
        keywords: parsed.keywords || [],
        topics: parsed.topics || [],
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Error parsing content analysis result:', error);
      return {
        sentiment: '중립',
        tone: '',
        keywords: [],
        topics: [],
        confidence: 0
      };
    }
  }

  // 콘텐츠 분석 메서드
  public async analyzeContent(input: ContentAnalysisInput): Promise<AIChainResult> {
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
      console.error('ContentAnalysisChain analyzeContent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
