import { supabase, AI_CONFIG } from '../clients';
import type { AIDocument } from '../types/store';

// 브라우저 환경에서는 간단한 메모리 기반 구현 사용
interface VectorStoreDocument {
  pageContent: string;
  metadata: Record<string, any>;
}

export class StoreVectorIndex {
  private documents: VectorStoreDocument[] = [];
  private isServer: boolean;

  constructor() {
    // 서버 환경인지 확인 (Node.js 환경에서는 process가 존재)
    this.isServer = typeof process !== 'undefined' && !!process.env;
  }

  /**
   * 가게 정보를 벡터 인덱스에 추가
   */
  async addStoreDocuments(documents: AIDocument[]): Promise<void> {
    try {
      const newDocuments = documents.map(doc => ({
        pageContent: doc.content,
        metadata: {
          id: doc.id || '',
          store_slug: doc.store_slug,
          type: doc.type,
          created_at: doc.created_at || new Date().toISOString()
        }
      }));

      this.documents.push(...newDocuments);
      console.log(`Added ${documents.length} documents to vector index`);
    } catch (error) {
      console.error('Error adding documents to vector index:', error);
      throw error;
    }
  }

  /**
   * 의미 기반 검색 수행
   */
  async semanticSearch(
    query: string,
    storeSlug?: string,
    type?: string,
    limit: number = 5
  ): Promise<AIDocument[]> {
    try {
      // 간단한 키워드 기반 검색으로 임시 구현
      const filteredDocs = this.documents.filter(doc => {
        if (storeSlug && doc.metadata.store_slug !== storeSlug) return false;
        if (type && doc.metadata.type !== type) return false;
        return true;
      });

      const results = filteredDocs
        .filter(doc => doc.pageContent.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit)
        .map(doc => ({
          id: doc.metadata.id || '',
          store_slug: doc.metadata.store_slug || '',
          content: doc.pageContent,
          type: doc.metadata.type || '',
          created_at: doc.metadata.created_at || new Date().toISOString()
        }));

      return results;
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }
  }

  /**
   * 유사한 스타일의 가게 검색
   */
  async findSimilarStores(
    storeSlug: string,
    limit: number = 3
  ): Promise<AIDocument[]> {
    try {
      // 현재 가게 정보 찾기
      const currentStore = this.documents.find(doc => doc.metadata.store_slug === storeSlug);
      if (!currentStore) return [];

      // 유사한 스타일의 다른 가게들 검색
      const similarStores = this.documents
        .filter(doc => doc.metadata.store_slug !== storeSlug)
        .slice(0, limit)
        .map(doc => ({
          id: doc.metadata.id || '',
          store_slug: doc.metadata.store_slug || '',
          content: doc.pageContent,
          type: doc.metadata.type || '',
          created_at: doc.metadata.created_at || new Date().toISOString()
        }));

      return similarStores;
    } catch (error) {
      console.error('Error finding similar stores:', error);
      throw error;
    }
  }

  /**
   * 인덱스 초기화
   */
  async initialize(): Promise<void> {
    try {
      console.log('Vector index initialized with in-memory storage');
    } catch (error) {
      console.log('Vector index initialization error:', error);
    }
  }

  /**
   * 인덱스 상태 확인
   */
  isInitialized(): boolean {
    return true; // 메모리 기반이므로 항상 초기화됨
  }
}

// 싱글톤 인스턴스
export const storeVectorIndex = new StoreVectorIndex();
