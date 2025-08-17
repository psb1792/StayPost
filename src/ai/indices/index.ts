// 인덱스 시스템 통합 모듈
export { storeVectorIndex } from './vector-store';
export { keywordIndex, type RelatedWord, type KeywordSearchResult } from './keyword-index';

// 인덱스 초기화 및 관리
export class IndexManager {
  private static instance: IndexManager;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): IndexManager {
    if (!IndexManager.instance) {
      IndexManager.instance = new IndexManager();
    }
    return IndexManager.instance;
  }

  /**
   * 모든 인덱스 초기화
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing all indices...');

      // 벡터 인덱스 초기화
      await storeVectorIndex.initialize();

      // 키워드 인덱스는 생성자에서 자동 초기화됨
      // 추가 초기화 작업이 필요한 경우 여기에 추가

      this.isInitialized = true;
      console.log('All indices initialized successfully');
    } catch (error) {
      console.error('Error initializing indices:', error);
      throw error;
    }
  }

  /**
   * 인덱스 상태 확인
   */
  getStatus(): {
    vectorIndex: boolean;
    keywordIndex: boolean;
    overall: boolean;
  } {
    return {
      vectorIndex: storeVectorIndex.isInitialized(),
      keywordIndex: keywordIndex.isInitialized(),
      overall: this.isInitialized
    };
  }

  /**
   * 인덱스 통계 조회
   */
  getStats(): {
    vectorIndexSize: number;
    keywordIndexSize: number;
    totalIndices: number;
  } {
    return {
      vectorIndexSize: 0, // TODO: 벡터 인덱스 크기 구현
      keywordIndexSize: keywordIndex.getCacheSize(),
      totalIndices: 2
    };
  }

  /**
   * 인덱스 재구성
   */
  async rebuild(): Promise<void> {
    try {
      console.log('Rebuilding all indices...');
      
      // 기존 인덱스 정리
      this.isInitialized = false;
      
      // 인덱스 재초기화
      await this.initialize();
      
      console.log('All indices rebuilt successfully');
    } catch (error) {
      console.error('Error rebuilding indices:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const indexManager = IndexManager.getInstance();
