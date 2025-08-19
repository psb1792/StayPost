import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseAIChain, AIChainResult } from '../chains/base-chain';
import { routerQueryEngine, type SearchResult } from './router-query-engine';

// Self-Query Retriever 입력 타입
export interface SelfQueryInput {
  query: string;
  availableFilters?: string[];
  context?: string;
}

// Self-Query Retriever 출력 타입
export interface SelfQueryOutput {
  searchQuery: string;
  filters: Record<string, any>;
  reasoning: string;
  confidence: number;
}

// Self-Query Retriever 체인
export class SelfQueryRetrieverChain extends BaseAIChain<SelfQueryInput, SelfQueryOutput> {
  constructor(apiKey: string) {
    super(apiKey);
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
      당신은 사용자의 자연어 요청을 분석하여 검색 쿼리와 필터를 생성하는 전문가입니다.
      
      사용자 요청: {query}
      사용 가능한 필터: {availableFilters}
      컨텍스트: {context}
      
      다음을 수행해주세요:
      1. 사용자 요청에서 핵심 검색 키워드를 추출
      2. 메타데이터 필터 조건을 식별
      3. 검색 전략을 결정
      
      JSON 형태로 응답해주세요:
      {{
        "searchQuery": "의미 검색용 쿼리",
        "filters": {{
          "season": "여름",
          "purpose": "홍보",
          "style": "시원한",
          "hasImage": false
        }},
        "reasoning": "분석 근거",
        "confidence": 0.95
      }}
      
      필터 예시:
      - season: "봄", "여름", "가을", "겨울"
      - purpose: "홍보", "안내", "이벤트", "일반"
      - style: "시원한", "따뜻한", "경쾌한", "차분한"
      - hasImage: true, false
      - category: "음식점", "숙박", "카페", "기타"
    `);
  }

  protected validateInput(input: SelfQueryInput): boolean {
    return !!(input.query && input.query.trim().length > 0);
  }

  protected postProcess(result: any): SelfQueryOutput {
    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        searchQuery: parsed.searchQuery || '',
        filters: parsed.filters || {},
        reasoning: parsed.reasoning || '',
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Error parsing self-query result:', error);
      return {
        searchQuery: '',
        filters: {},
        reasoning: '',
        confidence: 0
      };
    }
  }

  /**
   * Self-Query Retriever 메인 메서드
   */
  public async retrieve(input: SelfQueryInput): Promise<{
    success: boolean;
    results?: SearchResult[];
    query?: SelfQueryOutput;
    error?: string;
  }> {
    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input data'
        };
      }

      // 1. 사용자 요청을 구조화된 쿼리로 변환
      const queryResult = await this.invoke(input);
      
      if (!queryResult.success) {
        return {
          success: false,
          error: queryResult.error || 'Failed to parse query'
        };
      }

      const query = queryResult.data as SelfQueryOutput;

      // 2. 라우터 쿼리 엔진으로 검색 수행
      const searchResults = await routerQueryEngine.query(query.searchQuery);

      // 3. 필터 적용 (간단한 구현)
      const filteredResults = this.applyFilters(searchResults, query.filters);

      return {
        success: true,
        results: filteredResults,
        query: query
      };

    } catch (error) {
      console.error('SelfQueryRetrieverChain retrieve error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 필터 적용
   */
  private applyFilters(results: SearchResult[], filters: Record<string, any>): SearchResult[] {
    if (!filters || Object.keys(filters).length === 0) {
      return results;
    }

    return results.filter(result => {
      // 메타데이터 기반 필터링
      if (result.metadata) {
        for (const [key, value] of Object.entries(filters)) {
          if (result.metadata[key] !== undefined && result.metadata[key] !== value) {
            return false;
          }
        }
      }
      
      // 콘텐츠 기반 필터링
      const content = result.content.toLowerCase();
      
      if (filters.season) {
        const seasonKeywords = {
          '봄': ['봄', '벚꽃', '따뜻한', '신선한'],
          '여름': ['여름', '시원한', '상쾌한', '더운'],
          '가을': ['가을', '단풍', '차분한', '고요한'],
          '겨울': ['겨울', '따뜻한', '포근한', '차가운']
        };
        
        const keywords = seasonKeywords[filters.season as keyof typeof seasonKeywords] || [];
        if (keywords.length > 0 && !keywords.some(keyword => content.includes(keyword))) {
          return false;
        }
      }

      if (filters.purpose) {
        const purposeKeywords = {
          '홍보': ['홍보', '소개', '추천', '인기'],
          '안내': ['안내', '정보', '알림', '공지'],
          '이벤트': ['이벤트', '행사', '특별', '할인']
        };
        
        const keywords = purposeKeywords[filters.purpose as keyof typeof purposeKeywords] || [];
        if (keywords.length > 0 && !keywords.some(keyword => content.includes(keyword))) {
          return false;
        }
      }

      return true;
    });
  }
}

// 싱글톤 인스턴스 (지연 초기화)
let selfQueryRetrieverInstance: SelfQueryRetrieverChain | null = null;

export function getSelfQueryRetriever(apiKey?: string): SelfQueryRetrieverChain {
  if (!selfQueryRetrieverInstance) {
    if (!apiKey) {
      throw new Error('API key is required for SelfQueryRetrieverChain');
    }
    selfQueryRetrieverInstance = new SelfQueryRetrieverChain(apiKey);
  }
  return selfQueryRetrieverInstance;
}
