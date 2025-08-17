import { storeService } from '../services/store-service';
import { hybridSearch } from '../retrieval/hybrid-search';
import { AIInitializer } from '../utils/initializer';
import type { StoreProfile, StorePolicy } from '../types/store';

/**
 * 가게 정보 저장 시스템 테스트
 */
export class StoreSystemTest {
  /**
   * 전체 시스템 테스트 실행
   */
  static async runAllTests(): Promise<void> {
    console.log('🧪 Starting Store System Tests...\n');

    try {
      // 1. 시스템 초기화
      await this.testInitialization();
      
      // 2. 샘플 데이터 생성
      await this.testSampleDataCreation();
      
      // 3. 가게 정보 저장 테스트
      await this.testStoreInfoSaving();
      
      // 4. 검색 기능 테스트
      await this.testSearchFunctionality();
      
      // 5. 콘텐츠 적합성 검사 테스트
      await this.testContentCompliance();
      
      // 6. 유사한 가게 찾기 테스트
      await this.testSimilarStores();

      console.log('\n✅ All tests passed successfully!');
    } catch (error) {
      console.error('\n❌ Test failed:', error);
      throw error;
    }
  }

  /**
   * 시스템 초기화 테스트
   */
  private static async testInitialization(): Promise<void> {
    console.log('1. Testing system initialization...');
    
    await AIInitializer.initialize();
    
    const status = await AIInitializer.checkSystemStatus();
    console.log('   System status:', status);
    
    if (!status.vectorIndex || !status.database) {
      throw new Error('System initialization failed');
    }
    
    console.log('   ✅ Initialization test passed\n');
  }

  /**
   * 샘플 데이터 생성 테스트
   */
  private static async testSampleDataCreation(): Promise<void> {
    console.log('2. Testing sample data creation...');
    
    await AIInitializer.createSampleData();
    
    // 데이터가 제대로 저장되었는지 확인
    const storeInfo = await storeService.getStoreInfo('hong-pension');
    
    if (!storeInfo.success || !storeInfo.data?.profile) {
      throw new Error('Sample data creation failed');
    }
    
    console.log('   ✅ Sample data creation test passed\n');
  }

  /**
   * 가게 정보 저장 테스트
   */
  private static async testStoreInfoSaving(): Promise<void> {
    console.log('3. Testing store info saving...');
    
    const testProfile: StoreProfile = {
      store_slug: 'test-pension',
      store_name: '테스트펜션',
      customer_profile: '20~30대 커플 타겟, 힙하고 트렌디한 분위기',
      instagram_style: '모던하고 세련된 톤, 인스타그래머블한 공간',
      pension_introduction: '트렌디한 디자인과 편안한 휴식을 동시에 즐길 수 있는 펜션입니다.',
    };

    const testPolicy: StorePolicy = {
      store_slug: 'test-pension',
      forbidden_words: ['구식', '오래됨', '지루함'],
      required_words: ['트렌디', '모던', '힙'],
      brand_names: ['테스트펜션'],
      location_names: ['서울', '강남'],
      tone_preferences: ['모던', '세련', '힙'],
      target_audience: ['커플', '20대', '30대']
    };

    // 프로필 저장 테스트
    const profileResult = await storeService.saveStoreProfile(testProfile);
    if (!profileResult.success) {
      throw new Error('Profile saving failed');
    }

    // 정책 저장 테스트
    const policyResult = await storeService.saveStorePolicy(testPolicy);
    if (!policyResult.success) {
      throw new Error('Policy saving failed');
    }

    console.log('   ✅ Store info saving test passed\n');
  }

  /**
   * 검색 기능 테스트
   */
  private static async testSearchFunctionality(): Promise<void> {
    console.log('4. Testing search functionality...');
    
    // 의미 기반 검색 테스트
    const searchResults = await storeService.searchStores('자연 친화적 펜션', 3);
    if (!searchResults.success) {
      throw new Error('Search functionality failed');
    }
    
    console.log(`   Found ${searchResults.data?.length || 0} results`);
    
    // 스타일 기반 추천 테스트
    const styleResults = await hybridSearch.styleBasedRecommendation(
      'hong-pension',
      'peaceful',
      'calm',
      2
    );
    
    console.log(`   Style recommendations: ${styleResults.length}`);
    
    console.log('   ✅ Search functionality test passed\n');
  }

  /**
   * 콘텐츠 적합성 검사 테스트
   */
  private static async testContentCompliance(): Promise<void> {
    console.log('5. Testing content compliance...');
    
    // 적합한 콘텐츠 테스트
    const goodContent = '자연 속에서 편안한 휴식을 즐길 수 있는 펜션입니다.';
    const goodResult = await storeService.checkContentCompliance(goodContent, 'hong-pension');
    
    if (!goodResult.success) {
      throw new Error('Content compliance check failed');
    }
    
    console.log(`   Good content compliant: ${goodResult.data?.compliant}`);
    
    // 부적합한 콘텐츠 테스트 (금지어 포함)
    const badContent = '급하게 예약하세요! 과장된 광고 문구입니다.';
    const badResult = await storeService.checkContentCompliance(badContent, 'hong-pension');
    
    console.log(`   Bad content compliant: ${badResult.data?.compliant}`);
    if (badResult.data?.issues) {
      console.log(`   Issues found: ${badResult.data.issues.length}`);
    }
    
    console.log('   ✅ Content compliance test passed\n');
  }

  /**
   * 유사한 가게 찾기 테스트
   */
  private static async testSimilarStores(): Promise<void> {
    console.log('6. Testing similar stores...');
    
    const similarResults = await storeService.findSimilarStores('hong-pension', 2);
    
    if (!similarResults.success) {
      throw new Error('Similar stores search failed');
    }
    
    console.log(`   Found ${similarResults.data?.length || 0} similar stores`);
    
    console.log('   ✅ Similar stores test passed\n');
  }

  /**
   * 성능 테스트
   */
  static async runPerformanceTest(): Promise<void> {
    console.log('🚀 Running performance test...');
    
    const startTime = Date.now();
    
    // 여러 검색을 동시에 실행
    const promises = [
      storeService.searchStores('자연', 5),
      storeService.searchStores('편안', 5),
      storeService.searchStores('휴식', 5),
      storeService.checkContentCompliance('자연 속 편안한 휴식', 'hong-pension'),
      storeService.findSimilarStores('hong-pension', 3),
    ];
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const successCount = results.filter(r => r.success).length;
    const totalTime = endTime - startTime;
    
    console.log(`   Performance test completed in ${totalTime}ms`);
    console.log(`   Success rate: ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(1)}%)`);
    
    if (successCount === results.length) {
      console.log('   ✅ Performance test passed\n');
    } else {
      console.log('   ⚠️ Performance test partially failed\n');
    }
  }
}

// 테스트 실행 함수 (브라우저에서 호출 가능)
export async function runStoreSystemTests(): Promise<void> {
  try {
    await StoreSystemTest.runAllTests();
    await StoreSystemTest.runPerformanceTest();
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}
