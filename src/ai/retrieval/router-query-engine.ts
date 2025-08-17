import { storeVectorIndex } from '../indices/vector-store';
import { keywordIndex, type KeywordSearchResult } from '../indices/keyword-index';

// 검색 결과 타입
export interface SearchResult {
  content: string;
  source: string;
  score: number;
  type: 'vector' | 'keyword' | 'hybrid';
  metadata?: Record<string, any>;
}

// 라우터 쿼리 엔진 설정
export interface RouterConfig {
  vectorWeight: number;
  keywordWeight: number;
  maxResults: number;
  minScore: number;
}

// 라우터 쿼리 엔진
export class RouterQueryEngine {
  private config: RouterConfig;

  constructor(config: Partial<RouterConfig> = {}) {
    this.config = {
      vectorWeight: 0.7,
      keywordWeight: 0.3,
      maxResults: 10,
      minScore: 0.3,
      ...config
    };
  }

  /**
   * 쿼리 유형을 판단하여 최적의 검색 전략을 선택
   */
  private async determineQueryType(query: string): Promise<'vector' | 'keyword' | 'hybrid'> {
    const queryLower = query.toLowerCase();
    
    // 키워드 기반 검색이 적합한 경우
    const keywordIndicators = [
      '금지어', '정책', '체크리스트', '규칙', '가이드라인',
      '브랜드', '태그', '해시태그', '필수', '제외'
    ];
    
    if (keywordIndicators.some(indicator => queryLower.includes(indicator))) {
      return 'keyword';
    }
    
    // 의미 기반 검색이 적합한 경우
    const vectorIndicators = [
      '스타일', '느낌', '분위기', '톤', '감정', '어떻게', '같은',
      '유사한', '비슷한', '참고', '예시', '사례'
    ];
    
    if (vectorIndicators.some(indicator => queryLower.includes(indicator))) {
      return 'vector';
    }
    
    // 기본적으로 하이브리드 검색
    return 'hybrid';
  }

  /**
   * 벡터 검색 수행
   */
  private async vectorSearch(query: string): Promise<SearchResult[]> {
    try {
      const results = await storeVectorIndex.search(query, this.config.maxResults);
      return results.map(result => ({
        content: result.content,
        source: result.source || 'vector_index',
        score: result.score || 0.5,
        type: 'vector' as const,
        metadata: result.metadata
      }));
    } catch (error) {
      console.error('Vector search error:', error);
      return [];
    }
  }

  /**
   * 키워드 검색 수행
   */
  private async keywordSearch(query: string): Promise<SearchResult[]> {
    try {
      const results = await keywordIndex.search(query);
      return results.map(result => ({
        content: result.content,
        source: result.source || 'keyword_index',
        score: result.relevance || 0.5,
        type: 'keyword' as const,
        metadata: result.metadata
      }));
    } catch (error) {
      console.error('Keyword search error:', error);
      return [];
    }
  }

  /**
   * 하이브리드 검색 수행
   */
  private async hybridSearch(query: string): Promise<SearchResult[]> {
    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorSearch(query),
      this.keywordSearch(query)
    ]);

    // 결과 통합 및 스코어 조정
    const combinedResults = new Map<string, SearchResult>();

    // 벡터 검색 결과 추가
    vectorResults.forEach(result => {
      const key = result.content.substring(0, 100); // 중복 제거를 위한 키
      combinedResults.set(key, {
        ...result,
        score: result.score * this.config.vectorWeight
      });
    });

    // 키워드 검색 결과 추가/업데이트
    keywordResults.forEach(result => {
      const key = result.content.substring(0, 100);
      const existing = combinedResults.get(key);
      
      if (existing) {
        // 기존 결과가 있으면 스코어 조정
        existing.score = Math.max(existing.score, result.score * this.config.keywordWeight);
        existing.type = 'hybrid';
      } else {
        // 새로운 결과 추가
        combinedResults.set(key, {
          ...result,
          score: result.score * this.config.keywordWeight
        });
      }
    });

    // 스코어 순으로 정렬하고 필터링
    return Array.from(combinedResults.values())
      .filter(result => result.score >= this.config.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults);
  }

  /**
   * 메인 쿼리 메서드
   */
  public async query(query: string): Promise<SearchResult[]> {
    try {
      const queryType = await this.determineQueryType(query);
      
      let results: SearchResult[];
      
      switch (queryType) {
        case 'vector':
          results = await this.vectorSearch(query);
          break;
        case 'keyword':
          results = await this.keywordSearch(query);
          break;
        case 'hybrid':
        default:
          results = await this.hybridSearch(query);
          break;
      }

      // 결과 후처리
      return this.postProcessResults(results, queryType);
      
    } catch (error) {
      console.error('Router query error:', error);
      return [];
    }
  }

  /**
   * 결과 후처리
   */
  private postProcessResults(results: SearchResult[], queryType: string): SearchResult[] {
    return results
      .filter(result => result.content && result.content.trim().length > 0)
      .map(result => ({
        ...result,
        content: result.content.trim(),
        score: Math.min(Math.max(result.score, 0), 1) // 0-1 범위로 정규화
      }));
  }

  /**
   * 설정 업데이트
   */
  public updateConfig(newConfig: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 현재 설정 조회
   */
  public getConfig(): RouterConfig {
    return { ...this.config };
  }
}

// 싱글톤 인스턴스
export const routerQueryEngine = new RouterQueryEngine();
