import { supabase } from '../clients';
import { storeVectorIndex } from '../indices/vector-store';
import { keywordIndex } from '../indices/keyword-index';
import { hybridSearch } from '../retrieval/hybrid-search';
import type { 
  StoreProfile, 
  StorePolicy, 
  AIDocument, 
  StoreInfo,
  AIResponse 
} from '../types/store';

export class StoreService {
  /**
   * 가게 프로필 저장
   */
  async saveStoreProfile(profile: StoreProfile): Promise<AIResponse<StoreProfile>> {
    const startTime = Date.now();
    
    try {
      // 1. Supabase에 프로필 저장
      const { data, error } = await supabase
        .from('store_profiles')
        .upsert(profile, { onConflict: 'store_slug' })
        .select()
        .single();

      if (error) throw error;

      // 2. AI 인덱스에 문서 추가
      await this.indexStoreProfile(data);

      return {
        success: true,
        data,
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('Error saving store profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * 가게 정책 저장
   */
  async saveStorePolicy(policy: StorePolicy): Promise<AIResponse<StorePolicy>> {
    const startTime = Date.now();
    
    try {
      // 1. Supabase에 정책 저장
      const { data, error } = await supabase
        .from('store_policies')
        .upsert(policy, { onConflict: 'store_slug' })
        .select()
        .single();

      if (error) throw error;

      // 2. AI 인덱스에 문서 추가
      await this.indexStorePolicy(data);

      return {
        success: true,
        data,
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('Error saving store policy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * 가게 정보 조회
   */
  async getStoreInfo(storeSlug: string): Promise<AIResponse<StoreInfo>> {
    const startTime = Date.now();
    
    try {
      // 1. 프로필 조회
      const { data: profile, error: profileError } = await supabase
        .from('store_profiles')
        .select('*')
        .eq('store_slug', storeSlug)
        .single();

      if (profileError) throw profileError;

      // 2. 정책 조회
      const { data: policy, error: policyError } = await supabase
        .from('store_policies')
        .select('*')
        .eq('store_slug', storeSlug)
        .single();

      if (policyError && policyError.code !== 'PGRST116') {
        throw policyError;
      }

      // 3. AI 문서 조회
      const { data: documents, error: docsError } = await supabase
        .from('ai_kb_documents')
        .select('*')
        .eq('store_slug', storeSlug)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      return {
        success: true,
        data: {
          profile,
          policy: policy || { store_slug: storeSlug },
          documents: documents || [],
        },
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('Error getting store info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * 가게 프로필을 AI 인덱스에 추가
   */
  private async indexStoreProfile(profile: StoreProfile): Promise<void> {
    const documents: AIDocument[] = [];

    // 기본 프로필 정보
    if (profile.customer_profile) {
      documents.push({
        store_slug: profile.store_slug,
        content: profile.customer_profile,
        type: 'profile',
        axis: 'target',
        metadata: { field: 'customer_profile' },
      });
    }

    if (profile.instagram_style) {
      documents.push({
        store_slug: profile.store_slug,
        content: profile.instagram_style,
        type: 'style',
        axis: 'tone',
        metadata: { field: 'instagram_style' },
      });
    }

    if (profile.pension_introduction) {
      documents.push({
        store_slug: profile.store_slug,
        content: profile.pension_introduction,
        type: 'profile',
        axis: 'general',
        metadata: { field: 'pension_introduction' },
      });
    }

    // 벡터 인덱스에 추가
    if (documents.length > 0) {
      await storeVectorIndex.addStoreDocuments(documents);
    }

    // 키워드 인덱스에 추가
    for (const doc of documents) {
      await keywordIndex.addKeywordDocument(doc);
    }
  }

  /**
   * 가게 정책을 AI 인덱스에 추가
   */
  private async indexStorePolicy(policy: StorePolicy): Promise<void> {
    const documents: AIDocument[] = [];

    // 금지어
    if (policy.forbidden_words && policy.forbidden_words.length > 0) {
      documents.push({
        store_slug: policy.store_slug,
        content: policy.forbidden_words.join(', '),
        type: 'policy',
        axis: 'general',
        metadata: { field: 'forbidden_words' },
      });
    }

    // 필수어
    if (policy.required_words && policy.required_words.length > 0) {
      documents.push({
        store_slug: policy.store_slug,
        content: policy.required_words.join(', '),
        type: 'policy',
        axis: 'general',
        metadata: { field: 'required_words' },
      });
    }

    // 브랜드명
    if (policy.brand_names && policy.brand_names.length > 0) {
      documents.push({
        store_slug: policy.store_slug,
        content: policy.brand_names.join(', '),
        type: 'keyword',
        axis: 'general',
        metadata: { field: 'brand_names' },
      });
    }

    // 지역명
    if (policy.location_names && policy.location_names.length > 0) {
      documents.push({
        store_slug: policy.store_slug,
        content: policy.location_names.join(', '),
        type: 'keyword',
        axis: 'general',
        metadata: { field: 'location_names' },
      });
    }

    // 톤 선호도
    if (policy.tone_preferences && policy.tone_preferences.length > 0) {
      documents.push({
        store_slug: policy.store_slug,
        content: policy.tone_preferences.join(', '),
        type: 'style',
        axis: 'tone',
        metadata: { field: 'tone_preferences' },
      });
    }

    // 타겟 고객
    if (policy.target_audience && policy.target_audience.length > 0) {
      documents.push({
        store_slug: policy.store_slug,
        content: policy.target_audience.join(', '),
        type: 'style',
        axis: 'target',
        metadata: { field: 'target_audience' },
      });
    }

    // 벡터 인덱스에 추가
    if (documents.length > 0) {
      await storeVectorIndex.addStoreDocuments(documents);
    }

    // 키워드 인덱스에 추가
    for (const doc of documents) {
      await keywordIndex.addKeywordDocument(doc);
    }
  }

  /**
   * 가게 검색
   */
  async searchStores(query: string, limit: number = 5): Promise<AIResponse<any[]>> {
    const startTime = Date.now();
    
    try {
      const results = await hybridSearch.hybridSearch(query, undefined, undefined, limit);
      
      return {
        success: true,
        data: results,
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('Error searching stores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * 유사한 가게 찾기
   */
  async findSimilarStores(storeSlug: string, limit: number = 3): Promise<AIResponse<any[]>> {
    const startTime = Date.now();
    
    try {
      const results = await hybridSearch.findSimilarStores(storeSlug, limit);
      
      return {
        success: true,
        data: results,
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('Error finding similar stores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * 콘텐츠 적합성 검사
   */
  async checkContentCompliance(
    content: string,
    storeSlug: string
  ): Promise<AIResponse<any>> {
    const startTime = Date.now();
    
    try {
      const result = await hybridSearch.checkContentCompliance(content, storeSlug);
      
      return {
        success: true,
        data: result,
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('Error checking content compliance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          model: 'store-service',
          latency_ms: Date.now() - startTime,
        },
      };
    }
  }
}

// 싱글톤 인스턴스
export const storeService = new StoreService();
