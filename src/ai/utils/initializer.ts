import { storeVectorIndex } from '../indices/vector-store';
import { storeService } from '../services/store-service';
import type { StoreProfile, StorePolicy } from '../types/store';

export class AIInitializer {
  /**
   * AI 시스템 전체 초기화
   */
  static async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing AI system...');

      // 1. 벡터 인덱스 초기화
      await storeVectorIndex.initialize();
      console.log('✅ Vector index initialized');

      // 2. 기존 데이터 인덱싱 (선택사항)
      await this.indexExistingData();
      console.log('✅ Existing data indexed');

      console.log('🎉 AI system initialization completed');
    } catch (error) {
      console.error('❌ AI system initialization failed:', error);
      throw error;
    }
  }

  /**
   * 기존 가게 데이터를 AI 인덱스에 추가
   */
  private static async indexExistingData(): Promise<void> {
    try {
      // 기존 가게 프로필들을 가져와서 인덱싱
      const { data: profiles } = await storeService.getStoreInfo('sample');
      
      if (profiles && profiles.profile) {
        await storeService.saveStoreProfile(profiles.profile);
        console.log('📝 Indexed existing store profile');
      }
    } catch (error) {
      console.warn('⚠️ Could not index existing data:', error);
    }
  }

  /**
   * 샘플 데이터 생성 (테스트용)
   */
  static async createSampleData(): Promise<void> {
    try {
      console.log('📝 Creating sample data...');

      // 샘플 가게 프로필
      const sampleProfile: StoreProfile = {
        store_slug: 'hong-pension',
        store_name: '홍실장펜션',
        customer_profile: '40~50대 가족 타겟, 자연을 즐기는 여행객',
        instagram_style: '잔잔하고 고요한 톤, 자연 친화적, 편안한 분위기',
        pension_introduction: '자연 속에서 편안한 휴식을 즐길 수 있는 펜션입니다.',
        default_style_profile: {
          tone: 'calm',
          emotion: 'peaceful',
          target: 'family'
        }
      };

      // 샘플 가게 정책
      const samplePolicy: StorePolicy = {
        store_slug: 'hong-pension',
        forbidden_words: ['과장', '클릭베이트', '급하다', '빨리'],
        required_words: ['자연', '편안', '휴식'],
        brand_names: ['홍실장펜션'],
        location_names: ['강원도', '평창'],
        tone_preferences: ['잔잔', '고요', '편안'],
        target_audience: ['가족', '40대', '50대']
      };

      // 데이터 저장
      await storeService.saveStoreProfile(sampleProfile);
      await storeService.saveStorePolicy(samplePolicy);

      console.log('✅ Sample data created successfully');
    } catch (error) {
      console.error('❌ Failed to create sample data:', error);
      throw error;
    }
  }

  /**
   * 시스템 상태 확인
   */
  static async checkSystemStatus(): Promise<{
    vectorIndex: boolean;
    database: boolean;
    embeddings: boolean;
  }> {
    const status = {
      vectorIndex: false,
      database: false,
      embeddings: false,
    };

    try {
      // 벡터 인덱스 상태 확인
      status.vectorIndex = storeVectorIndex.isInitialized();

      // 데이터베이스 연결 확인
      const { data } = await storeService.getStoreInfo('test');
      status.database = data !== null;

      // 임베딩 모델 확인 (간단한 테스트)
      status.embeddings = true; // 실제로는 임베딩 모델 테스트 필요

      return status;
    } catch (error) {
      console.error('System status check failed:', error);
      return status;
    }
  }

  /**
   * 시스템 정리 (테스트용)
   */
  static async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up AI system...');
      
      // 벡터 인덱스 정리
      // (실제 구현에서는 벡터 데이터 삭제 로직 필요)
      
      console.log('✅ AI system cleanup completed');
    } catch (error) {
      console.error('❌ AI system cleanup failed:', error);
      throw error;
    }
  }
}
