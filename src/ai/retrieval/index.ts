// 검색 시스템 통합 모듈
export { hybridSearch, type HybridSearchResult, type SearchOptions } from './hybrid-search';
export { routerQueryEngine, type SearchResult, type RouterConfig } from './router-query-engine';

// 검색 시스템 초기화 및 관리
export class RetrievalManager {
  private static instance: RetrievalManager;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): RetrievalManager {
    if (!RetrievalManager.instance) {
      RetrievalManager.instance = new RetrievalManager();
    }
    return RetrievalManager.instance;
  }

  /**
   * 검색 시스템 초기화
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing retrieval system...');

      // 라우터 쿼리 엔진 설정
      routerQueryEngine.updateConfig({
        vectorWeight: 0.7,
        keywordWeight: 0.3,
        maxResults: 10,
        minScore: 0.3
      });

      this.isInitialized = true;
      console.log('Retrieval system initialized successfully');
    } catch (error) {
      console.error('Error initializing retrieval system:', error);
      throw error;
    }
  }

  /**
   * 검색 시스템 상태 확인
   */
  getStatus(): {
    hybridSearch: boolean;
    routerQueryEngine: boolean;
    overall: boolean;
  } {
    return {
      hybridSearch: true, // 하이브리드 검색은 항상 사용 가능
      routerQueryEngine: true, // 라우터 쿼리 엔진은 항상 사용 가능
      overall: this.isInitialized
    };
  }

  /**
   * 검색 시스템 통계 조회
   */
  getStats(): {
    hybridSearchStats: any;
    routerConfig: any;
  } {
    return {
      hybridSearchStats: hybridSearch.getSearchStats(),
      routerConfig: routerQueryEngine.getConfig()
    };
  }
}

// 싱글톤 인스턴스
export const retrievalManager = RetrievalManager.getInstance();
