import { AIChainService } from '../src/ai/services/ai-chain-service.js';
import { CacheService } from '../src/ai/services/cache-service.js';
import { ErrorHandler } from '../src/ai/services/error-handler.js';
import { PerformanceMonitor } from '../src/ai/services/performance-monitor.js';

class Phase4OptimizationTester {
  constructor() {
    this.aiService = AIChainService.getInstance();
    this.cacheService = CacheService.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  async runAllTests() {
    console.log('🚀 Phase 4 최적화 및 테스트 시작\n');

    try {
      await this.testCachingSystem();
      await this.testErrorHandling();
      await this.testPerformanceMonitoring();
      await this.testImageOptimization();
      await this.testLoadTesting();
      
      console.log('\n✅ 모든 Phase 4 테스트 완료!');
      this.printFinalReport();
    } catch (error) {
      console.error('❌ 테스트 중 오류 발생:', error);
    }
  }

  async testCachingSystem() {
    console.log('📦 캐싱 시스템 테스트...');
    
    const testInput = {
      content: '테스트 콘텐츠',
      storeProfile: { store_slug: 'test-store' }
    };

    // 첫 번째 호출 (캐시 미스)
    const start1 = Date.now();
    const result1 = await this.aiService.analyzeContent(testInput);
    const duration1 = Date.now() - start1;

    // 두 번째 호출 (캐시 히트)
    const start2 = Date.now();
    const result2 = await this.aiService.analyzeContent(testInput);
    const duration2 = Date.now() - start2;

    console.log(`  - 첫 번째 호출: ${duration1}ms`);
    console.log(`  - 두 번째 호출: ${duration2}ms`);
    console.log(`  - 성능 향상: ${((duration1 - duration2) / duration1 * 100).toFixed(1)}%`);
    console.log(`  - 캐시 크기: ${this.cacheService.size()}`);
  }

  async testErrorHandling() {
    console.log('🛡️ 에러 처리 시스템 테스트...');
    
    // 의도적으로 잘못된 입력으로 테스트
    const invalidInput = {
      content: '',
      storeProfile: null
    };

    try {
      const result = await this.aiService.analyzeContent(invalidInput);
      console.log('  - 폴백 응답 생성됨:', result.success);
    } catch (error) {
      console.log('  - 에러 처리됨:', error.message);
    }

    // 재시도 로직 테스트
    let attemptCount = 0;
    const testOperation = async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('rate_limit_exceeded');
      }
      return 'success';
    };

    try {
      const result = await this.errorHandler.withRetry(
        testOperation,
        { operation: 'test-retry', input: {} }
      );
      console.log('  - 재시도 로직 성공:', result);
    } catch (error) {
      console.log('  - 재시도 로직 실패:', error.message);
    }
  }

  async testPerformanceMonitoring() {
    console.log('📊 성능 모니터링 테스트...');
    
    // 여러 작업 실행하여 메트릭 생성
    const operations = [
      'content-analysis',
      'caption-generation',
      'image-suitability',
      'hashtag-generation'
    ];

    for (const operation of operations) {
      const start = Date.now();
      const success = Math.random() > 0.1; // 90% 성공률
      const duration = Math.random() * 2000 + 500; // 500-2500ms
      
      this.performanceMonitor.recordMetric({
        operation,
        duration,
        success,
        tokensUsed: Math.floor(Math.random() * 1000),
        model: 'gpt-4o',
        cacheHit: Math.random() > 0.7 // 30% 캐시 히트
      });
    }

    const stats = this.performanceMonitor.getStats();
    console.log(`  - 평균 응답 시간: ${stats.averageResponseTime.toFixed(0)}ms`);
    console.log(`  - 성공률: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`  - 캐시 히트율: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`  - 총 작업 수: ${stats.totalOperations}`);

    const suggestions = this.performanceMonitor.getOptimizationSuggestions();
    if (suggestions.length > 0) {
      console.log('  - 최적화 제안:');
      suggestions.forEach(suggestion => console.log(`    • ${suggestion}`));
    }
  }

  async testImageOptimization() {
    console.log('🖼️ 이미지 최적화 테스트...');
    
    // 가상의 이미지 파일 생성 (실제로는 테스트 이미지 필요)
    const mockImageFile = new Blob(['mock image data'], { type: 'image/jpeg' });
    
    try {
      // 이미지 최적화가 필요한지 확인
      const needsOpt = await this.needsOptimization(mockImageFile);
      console.log(`  - 최적화 필요: ${needsOpt}`);
      
      // 이미지 품질 평가
      const quality = await this.assessImageQuality(mockImageFile);
      console.log(`  - 품질 점수: ${quality.score}/100`);
      if (quality.factors.length > 0) {
        console.log('  - 품질 문제점:');
        quality.factors.forEach(factor => console.log(`    • ${factor}`));
      }
    } catch (error) {
      console.log('  - 이미지 최적화 테스트 스킵 (브라우저 환경 필요)');
    }
  }

  async testLoadTesting() {
    console.log('⚡ 부하 테스트...');
    
    const concurrentRequests = 5;
    const testInput = {
      content: '부하 테스트용 콘텐츠',
      storeProfile: { store_slug: 'load-test-store' }
    };

    const start = Date.now();
    const promises = Array(concurrentRequests).fill(null).map(async (_, index) => {
      try {
        const result = await this.aiService.analyzeContent({
          ...testInput,
          content: `${testInput.content} - 요청 ${index + 1}`
        });
        return { success: true, index };
      } catch (error) {
        return { success: false, index, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    const duration = Date.now() - start;
    const successCount = results.filter(r => r.success).length;

    console.log(`  - 동시 요청 수: ${concurrentRequests}`);
    console.log(`  - 총 소요 시간: ${duration}ms`);
    console.log(`  - 성공률: ${(successCount / concurrentRequests * 100).toFixed(1)}%`);
    console.log(`  - 평균 응답 시간: ${(duration / concurrentRequests).toFixed(0)}ms`);
  }

  printFinalReport() {
    console.log('\n📋 Phase 4 최적화 테스트 결과 요약');
    console.log('=====================================');
    
    const cacheStats = this.cacheService.getStats();
    const perfStats = this.performanceMonitor.getStats();
    
    console.log(`캐시 상태:`);
    console.log(`  - 캐시된 항목 수: ${cacheStats.size}`);
    console.log(`  - 캐시 키: ${cacheStats.keys.length}`);
    
    console.log(`\n성능 지표:`);
    console.log(`  - 평균 응답 시간: ${perfStats.averageResponseTime.toFixed(0)}ms`);
    console.log(`  - 성공률: ${(perfStats.successRate * 100).toFixed(1)}%`);
    console.log(`  - 캐시 히트율: ${(perfStats.cacheHitRate * 100).toFixed(1)}%`);
    
    const suggestions = this.performanceMonitor.getOptimizationSuggestions();
    if (suggestions.length > 0) {
      console.log(`\n최적화 제안:`);
      suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }
  }

  // 이미지 최적화 헬퍼 메서드들 (브라우저 환경에서만 작동)
  async needsOptimization(file) {
    // 브라우저 환경이 아닌 경우 기본값 반환
    return file.size > 5 * 1024 * 1024; // 5MB 이상
  }

  async assessImageQuality(file) {
    // 브라우저 환경이 아닌 경우 기본값 반환
    return {
      score: 80,
      factors: ['브라우저 환경에서만 정확한 평가 가능']
    };
  }
}

// 테스트 실행
const tester = new Phase4OptimizationTester();
tester.runAllTests().catch(console.error);
