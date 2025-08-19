import { BaseAIChain, AIChainResult } from './base-chain';
import { IntentParsingChain, IntentParsingInput, IntentParsingOutput } from './intent-parsing';
import { getSelfQueryRetriever, SelfQueryOutput } from '../retrieval/self-query-retriever';
import { routerQueryEngine, SearchResult } from '../retrieval/router-query-engine';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// 통합 입력 타입
export interface IntentRetrievalInput {
  userRequest: string;
  context?: string;
  availableFilters?: string[];
}

// 통합 출력 타입
export interface IntentRetrievalOutput {
  intent: IntentParsingOutput;
  retrieval: {
    query: SelfQueryOutput;
    results: SearchResult[];
  };
  confidence: number;
}

// 의도 파싱 + 검색 통합 체인
export class IntentRetrievalChain extends BaseAIChain<IntentRetrievalInput, IntentRetrievalOutput> {
  private intentParser: IntentParsingChain;

  constructor(apiKey: string) {
    super(apiKey);
    this.intentParser = new IntentParsingChain(apiKey);
    this.initializeChain();
  }

  protected initializeChain(): void {
    this.prompt = this.getPromptTemplate();
    this.chain = this.prompt.pipe(this.llm);
  }

  protected getOutputSchema(): any {
    return null;
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromTemplate(`
      당신은 사용자 요청을 분석하고 관련 정보를 검색하는 통합 AI 시스템입니다.
      
      사용자 요청: {userRequest}
      컨텍스트: {context}
      
      다음 단계를 수행해주세요:
      1. 사용자 의도 분석
      2. 관련 정보 검색
      3. 결과 통합 및 최적화
      
      JSON 형태로 응답해주세요:
      {{
        "intent": {{
          "intent": "의도",
          "entities": ["엔티티1", "엔티티2"],
          "confidence": 0.95,
          "parameters": {{
            "season": "여름",
            "purpose": "홍보",
            "style": "시원한",
            "tone": "친근한",
            "hasImage": true,
            "category": "음식점",
            "targetAudience": "전체"
          }}
        }},
        "retrieval": {{
          "query": {{
            "searchQuery": "검색 쿼리",
            "filters": {{}},
            "reasoning": "검색 근거",
            "confidence": 0.9
          }},
          "results": []
        }},
        "confidence": 0.92
      }}
    `);
  }

  protected validateInput(input: IntentRetrievalInput): boolean {
    return !!(input.userRequest && input.userRequest.trim().length > 0);
  }

  protected postProcess(result: any): IntentRetrievalOutput {
    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        intent: parsed.intent || {},
        retrieval: parsed.retrieval || { query: {}, results: [] },
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Error parsing intent retrieval result:', error);
      return {
        intent: {
          intent: '',
          entities: [],
          confidence: 0,
          parameters: {}
        },
        retrieval: {
          query: {
            searchQuery: '',
            filters: {},
            reasoning: '',
            confidence: 0
          },
          results: []
        },
        confidence: 0
      };
    }
  }

  /**
   * 통합 의도 분석 및 검색 메서드
   */
  public async analyzeAndRetrieve(input: IntentRetrievalInput): Promise<{
    success: boolean;
    data?: IntentRetrievalOutput;
    error?: string;
  }> {
    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input data'
        };
      }

      // 1. 의도 파싱
      const intentResult = await this.intentParser.parseIntent({
        text: input.userRequest,
        context: input.context
      });

      if (!intentResult.success) {
        return {
          success: false,
          error: intentResult.error || 'Failed to parse intent'
        };
      }

      const intent = intentResult.data as IntentParsingOutput;

      // 2. Self-Query Retriever로 검색
      const retrievalResult = await getSelfQueryRetriever().retrieve({
        query: input.userRequest,
        availableFilters: input.availableFilters,
        context: input.context
      });

      if (!retrievalResult.success) {
        return {
          success: false,
          error: retrievalResult.error || 'Failed to retrieve information'
        };
      }

      // 3. 결과 통합
      const output: IntentRetrievalOutput = {
        intent: intent,
        retrieval: {
          query: retrievalResult.query!,
          results: retrievalResult.results || []
        },
        confidence: Math.min(intent.confidence, retrievalResult.query?.confidence || 0.5)
      };

      return {
        success: true,
        data: output
      };

    } catch (error) {
      console.error('IntentRetrievalChain analyzeAndRetrieve error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 의도 파싱만 수행
   */
  public async parseIntent(input: IntentRetrievalInput): Promise<AIChainResult> {
    return this.intentParser.parseIntent({
      text: input.userRequest,
      context: input.context
    });
  }

  /**
   * 검색만 수행
   */
  public async retrieve(input: IntentRetrievalInput): Promise<{
    success: boolean;
    results?: SearchResult[];
    query?: SelfQueryOutput;
    error?: string;
  }> {
    return getSelfQueryRetriever().retrieve({
      query: input.userRequest,
      availableFilters: input.availableFilters,
      context: input.context
    });
  }
}

// 싱글톤 인스턴스 (지연 초기화)
let intentRetrievalChainInstance: IntentRetrievalChain | null = null;

export function getIntentRetrievalChain(apiKey?: string): IntentRetrievalChain {
  if (!intentRetrievalChainInstance) {
    if (!apiKey) {
      throw new Error('API key is required for IntentRetrievalChain');
    }
    intentRetrievalChainInstance = new IntentRetrievalChain(apiKey);
  }
  return intentRetrievalChainInstance;
}
