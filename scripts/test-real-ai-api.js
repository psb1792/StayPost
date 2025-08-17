import { AIChainService } from '../src/ai/services/ai-chain-service.js';
import { CacheService } from '../src/ai/services/cache-service.js';
import { ErrorHandler } from '../src/ai/services/error-handler.js';
import { PerformanceMonitor } from '../src/ai/services/performance-monitor.js';

class RealAITester {
  constructor() {
    this.aiService = AIChainService.getInstance();
    this.cacheService = CacheService.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  async runAllTests() {
    console.log('🤖 실제 AI API 테스트 시작\n');

    // 환경 변수 확인
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('⚠️  OpenAI API 키가 설정되지 않았습니다.');
      console.log('   .env 파일에 OPENAI_API_KEY를 설정해주세요.');
      console.log('   예: OPENAI_API_KEY=sk-your-actual-api-key');
      return;
    }

    try {
      await this.testContentAnalysis();
      await this.testCaptionGeneration();
      await this.testImageSuitability();
      await this.testHashtagGeneration();
      await this.testIntentParsing();
      await this.testErrorHandling();
      
      console.log('\n✅ 모든 실제 AI API 테스트 완료!');
      this.printFinalReport();
    } catch (error) {
      console.error('❌ 테스트 중 오류 발생:', error);
    }
  }

  async testContentAnalysis() {
    console.log('📝 콘텐츠 분석 테스트...');
    
    const testInput = {
      content: '오늘은 정말 맛있는 커피를 마셨습니다. 카페 분위기도 좋고, 바리스타가 친절해서 기분이 좋았어요.',
      storeProfile: {
        store_slug: 'test-cafe',
        name: '테스트 카페',
        category: '카페',
        description: '친근하고 따뜻한 분위기의 커피숍',
        target_audience: '20-30대',
        brand_tone: '친근함'
      }
    };

    try {
      const start = Date.now();
      const result = await this.aiService.analyzeContent(testInput);
      const duration = Date.now() - start;

      console.log(`  - 응답 시간: ${duration}ms`);
      console.log(`  - 성공: ${result.success}`);
      
      if (result.success && result.data) {
        console.log(`  - 감정: ${result.data.emotion || 'N/A'}`);
        console.log(`  - 톤: ${result.data.tone || 'N/A'}`);
        console.log(`  - 키워드: ${result.data.keywords?.join(', ') || 'N/A'}`);
      } else {
        console.log(`  - 에러: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  - 예외 발생: ${error.message}`);
    }
  }

  async testCaptionGeneration() {
    console.log('✍️ 캡션 생성 테스트...');
    
    const testInput = {
      imageDescription: '따뜻한 조명 아래 놓인 아름다운 라떼 아트와 함께 있는 커피잔',
      userRequest: '감성적이고 따뜻한 느낌으로 작성해주세요',
      storeProfile: {
        store_slug: 'test-cafe',
        name: '테스트 카페',
        category: '카페',
        description: '친근하고 따뜻한 분위기의 커피숍',
        target_audience: '20-30대',
        brand_tone: '친근함'
      },
      emotion: '따뜻함',
      targetLength: 'medium'
    };

    try {
      const start = Date.now();
      const result = await this.aiService.generateCaption(testInput);
      const duration = Date.now() - start;

      console.log(`  - 응답 시간: ${duration}ms`);
      console.log(`  - 성공: ${result.success}`);
      
      if (result.success && result.data) {
        console.log(`  - 캡션: ${result.data.caption || 'N/A'}`);
        console.log(`  - 스타일: ${result.data.style || 'N/A'}`);
        console.log(`  - 길이: ${result.data.length || 'N/A'}`);
      } else {
        console.log(`  - 에러: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  - 예외 발생: ${error.message}`);
    }
  }

  async testImageSuitability() {
    console.log('🖼️ 이미지 적합성 판단 테스트...');
    
    const testInput = {
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
      storeMeta: {
        name: '테스트 카페',
        category: '카페',
        description: '친근하고 따뜻한 분위기의 커피숍',
        targetAudience: '20-30대',
        brandTone: '친근함',
        location: '서울'
      },
      context: {
        campaignType: '일반 포스팅',
        season: '가을'
      },
      useVision: true
    };

    try {
      const start = Date.now();
      const result = await this.aiService.checkImageSuitability(testInput);
      const duration = Date.now() - start;

      console.log(`  - 응답 시간: ${duration}ms`);
      console.log(`  - 성공: ${result.success}`);
      
      if (result.success && result.data) {
        console.log(`  - 적합성 점수: ${result.data.suitability_score || 'N/A'}`);
        console.log(`  - 적합 여부: ${result.data.is_suitable ? '적합' : '부적합'}`);
        console.log(`  - 추천사항: ${result.data.recommendations?.join(', ') || 'N/A'}`);
      } else {
        console.log(`  - 에러: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  - 예외 발생: ${error.message}`);
    }
  }

  async testHashtagGeneration() {
    console.log('🏷️ 해시태그 생성 테스트...');
    
    const testInput = {
      postContent: '오늘은 정말 맛있는 커피를 마셨습니다. 카페 분위기도 좋고, 바리스타가 친절해서 기분이 좋았어요.',
      storeInfo: {
        name: '테스트 카페',
        category: '카페',
        location: '서울',
        description: '친근하고 따뜻한 분위기의 커피숍',
        brandGuidelines: ['친근함', '따뜻함', '품질']
      },
      targetAudience: '20-30대',
      emotion: '따뜻함',
      maxHashtags: 10
    };

    try {
      const start = Date.now();
      const result = await this.aiService.generateHashtags(testInput);
      const duration = Date.now() - start;

      console.log(`  - 응답 시간: ${duration}ms`);
      console.log(`  - 성공: ${result.success}`);
      
      if (result.success && result.data) {
        console.log(`  - 해시태그: ${result.data.hashtags?.join(' ') || 'N/A'}`);
        console.log(`  - 개수: ${result.data.count || 'N/A'}`);
        console.log(`  - 신뢰도: ${result.data.confidence || 'N/A'}`);
      } else {
        console.log(`  - 에러: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  - 예외 발생: ${error.message}`);
    }
  }

  async testIntentParsing() {
    console.log('🧠 사용자 의도 파싱 테스트...');
    
    const testInput = {
      userRequest: '감성적이고 따뜻한 느낌으로 짧게 작성해주세요',
      storeProfile: {
        store_slug: 'test-cafe',
        name: '테스트 카페',
        category: '카페'
      }
    };

    try {
      const start = Date.now();
      const result = await this.aiService.parseIntent(testInput);
      const duration = Date.now() - start;

      console.log(`  - 응답 시간: ${duration}ms`);
      console.log(`  - 성공: ${result.success}`);
      
      if (result.success && result.data) {
        console.log(`  - 의도: ${result.data.intent || 'N/A'}`);
        console.log(`  - 파라미터: ${JSON.stringify(result.data.parameters) || 'N/A'}`);
        console.log(`  - 제안: ${result.data.suggestions?.join(', ') || 'N/A'}`);
      } else {
        console.log(`  - 에러: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  - 예외 발생: ${error.message}`);
    }
  }

  async testErrorHandling() {
    console.log('🛡️ 에러 처리 테스트...');
    
    // 의도적으로 잘못된 입력으로 테스트
    const invalidInput = {
      content: '',
      storeProfile: null
    };

    try {
      const result = await this.aiService.analyzeContent(invalidInput);
      console.log(`  - 폴백 응답 생성: ${result.success}`);
      if (result.success) {
        console.log(`  - 폴백 데이터: ${JSON.stringify(result.data)}`);
      }
    } catch (error) {
      console.log(`  - 에러 처리됨: ${error.message}`);
    }

    // API 키 오류 시뮬레이션
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'invalid-key';
    
    try {
      const result = await this.aiService.analyzeContent({
        content: '테스트',
        storeProfile: { store_slug: 'test' }
      });
      console.log(`  - 잘못된 API 키 처리: ${result.success}`);
    } catch (error) {
      console.log(`  - API 키 오류 처리됨: ${error.message}`);
    } finally {
      process.env.OPENAI_API_KEY = originalKey;
    }
  }

  printFinalReport() {
    console.log('\n📋 실제 AI API 테스트 결과 요약');
    console.log('=====================================');
    
    const cacheStats = this.cacheService.getStats();
    const perfStats = this.performanceMonitor.getStats();
    
    console.log(`캐시 상태:`);
    console.log(`  - 캐시된 항목 수: ${cacheStats.size}`);
    
    console.log(`\n성능 지표:`);
    console.log(`  - 평균 응답 시간: ${perfStats.averageResponseTime.toFixed(0)}ms`);
    console.log(`  - 성공률: ${(perfStats.successRate * 100).toFixed(1)}%`);
    console.log(`  - 총 작업 수: ${perfStats.totalOperations}`);
    
    const suggestions = this.performanceMonitor.getOptimizationSuggestions();
    if (suggestions.length > 0) {
      console.log(`\n최적화 제안:`);
      suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }

    console.log(`\n🎯 다음 단계:`);
    console.log(`  1. 성능 모니터링 대시보드 확인: http://localhost:5173/performance-monitoring`);
    console.log(`  2. 프론트엔드에서 실제 AI 기능 테스트`);
    console.log(`  3. 에러 처리 및 폴백 응답 검증`);
  }
}

// 테스트 실행
const tester = new RealAITester();
tester.runAllTests().catch(console.error);
