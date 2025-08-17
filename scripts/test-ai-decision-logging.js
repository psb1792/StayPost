#!/usr/bin/env node

/**
 * AI 결정 로깅 시스템 테스트 스크립트
 * Phase 2.4 4단계: AI 결정 과정 로깅 구현 테스트
 */

import { aiChainService } from '../src/ai/services/ai-chain-service.js';
import { aiDecisionLogger } from '../src/ai/services/ai-decision-logger.js';

// 테스트 데이터
const testStoreProfile = {
  store_slug: 'test-pension',
  store_name: '테스트 펜션',
  customer_profile: '30~40대 가족 타겟, 자연을 사랑하는 여행객',
  instagram_style: '따뜻하고 편안한 톤, 자연 친화적 분위기',
  pension_introduction: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.'
};

const testStorePolicy = {
  store_slug: 'test-pension',
  forbidden_words: ['과장', '거짓', '강요'],
  required_words: ['자연', '가족', '추억'],
  brand_names: ['테스트펜션'],
  location_names: ['강원도', '춘천'],
  tone_preferences: ['따뜻', '편안', '자연스러운'],
  target_audience: ['가족', '30대', '40대']
};

// 성능 측정 헬퍼
const measurePerformance = async (name, fn) => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    const duration = Math.round(end - start);
    console.log(`✅ ${name} completed in ${duration}ms`);
    return { success: true, result, duration };
  } catch (error) {
    const end = performance.now();
    const duration = Math.round(end - start);
    console.log(`❌ ${name} failed after ${duration}ms: ${error.message}`);
    return { success: false, error, duration };
  }
};

// AI 결정 로깅 테스트
async function testAIDecisionLogging() {
  console.log('🚀 Starting AI Decision Logging Test...\n');

  // 새 세션 시작
  const sessionId = aiDecisionLogger.startSession();
  console.log(`📝 Session started: ${sessionId}\n`);

  const testResults = [];

  try {
    // 1. 이미지 적합성 판단 테스트
    console.log('🔍 Testing Image Suitability...');
    const imageTest = await measurePerformance('Image Suitability Check', () =>
      aiChainService.checkImageSuitability({
        imageUrl: 'https://example.com/test-pension.jpg',
        storeMeta: {
          name: '테스트 펜션',
          category: '펜션',
          description: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션',
          targetAudience: '30~40대 가족',
          brandTone: '따뜻하고 편안한',
          location: '강원도 춘천'
        },
        context: {
          campaignType: '시즌 프로모션',
          season: '가을'
        },
        useVision: false
      })
    );
    testResults.push({ name: 'Image Suitability', ...imageTest });

    // 2. 사용자 의도 파싱 테스트
    console.log('\n🎯 Testing Intent Parsing...');
    const intentTest = await measurePerformance('Intent Parsing', () =>
      aiChainService.parseIntent({
        userRequest: '따뜻한 느낌으로 짧고 강렬하게 써주세요',
        storeProfile: testStoreProfile
      })
    );
    testResults.push({ name: 'Intent Parsing', ...intentTest });

    // 3. 스타일 제안 테스트
    console.log('\n🎨 Testing Style Suggestion...');
    const styleTest = await measurePerformance('Style Suggestion', () =>
      aiChainService.suggestStyle({
        emotion: '따뜻함',
        storeProfile: testStoreProfile,
        targetAudience: '가족'
      })
    );
    testResults.push({ name: 'Style Suggestion', ...styleTest });

    // 4. 캡션 생성 테스트
    console.log('\n✍️ Testing Caption Generation...');
    const captionTest = await measurePerformance('Caption Generation', () =>
      aiChainService.generateCaption({
        imageDescription: '노을 지는 숲속 펜션, 가족들이 함께 있는 따뜻한 분위기',
        userRequest: '따뜻하고 편안한 느낌으로',
        storeProfile: testStoreProfile,
        storePolicy: testStorePolicy,
        emotion: '따뜻함',
        targetLength: 'medium'
      })
    );
    testResults.push({ name: 'Caption Generation', ...captionTest });

    // 5. 규정 준수 검사 테스트
    console.log('\n✅ Testing Compliance Check...');
    const complianceTest = await measurePerformance('Compliance Check', () =>
      aiChainService.checkCompliance({
        content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 테스트펜션입니다.',
        storePolicy: testStorePolicy,
        storeProfile: testStoreProfile
      })
    );
    testResults.push({ name: 'Compliance Check', ...complianceTest });

    // 6. 콘텐츠 분석 테스트
    console.log('\n📊 Testing Content Analysis...');
    const analysisTest = await measurePerformance('Content Analysis', () =>
      aiChainService.analyzeContent({
        content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.',
        storeProfile: testStoreProfile,
        imageDescription: '숲속 펜션 전경, 잔잔한 분위기'
      })
    );
    testResults.push({ name: 'Content Analysis', ...analysisTest });

    // 7. 에러 로깅 테스트
    console.log('\n🚨 Testing Error Logging...');
    const errorTest = await measurePerformance('Error Logging', async () => {
      const monitor = aiDecisionLogger.createPerformanceMonitor('2.4', 'error-testing');
      try {
        throw new Error('This is a test error for logging demonstration');
      } catch (error) {
        await monitor.logError(
          error,
          { test: 'error logging test' },
          testStoreProfile.store_slug
        );
        return { errorLogged: true };
      }
    });
    testResults.push({ name: 'Error Logging', ...errorTest });

    // 8. 로그 조회 테스트
    console.log('\n📋 Testing Log Retrieval...');
    const logRetrievalTest = await measurePerformance('Log Retrieval', () =>
      aiDecisionLogger.getSessionLogs(sessionId)
    );
    testResults.push({ name: 'Log Retrieval', ...logRetrievalTest });

    // 9. 통계 조회 테스트
    console.log('\n📈 Testing Statistics Retrieval...');
    const statsTest = await measurePerformance('Statistics Retrieval', () =>
      aiDecisionLogger.getStoreAIStats(testStoreProfile.store_slug)
    );
    testResults.push({ name: 'Statistics Retrieval', ...statsTest });

    // 10. 로그 요약 조회 테스트
    console.log('\n📝 Testing Log Summary...');
    const summaryTest = await measurePerformance('Log Summary', () =>
      aiDecisionLogger.getLogSummary(testStoreProfile.store_slug, 7)
    );
    testResults.push({ name: 'Log Summary', ...summaryTest });

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }

  // 세션 종료
  aiDecisionLogger.endSession();
  console.log(`\n📝 Session ended: ${sessionId}`);

  // 결과 요약
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  
  const successfulTests = testResults.filter(t => t.success);
  const failedTests = testResults.filter(t => !t.success);
  
  console.log(`✅ Successful: ${successfulTests.length}/${testResults.length}`);
  console.log(`❌ Failed: ${failedTests.length}/${testResults.length}`);
  
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(test => {
      console.log(`  - ${test.name}: ${test.error?.message || 'Unknown error'}`);
    });
  }

  const avgDuration = testResults.reduce((sum, t) => sum + t.duration, 0) / testResults.length;
  console.log(`\n⏱️ Average Duration: ${Math.round(avgDuration)}ms`);

  // 성공률 계산
  const successRate = (successfulTests.length / testResults.length) * 100;
  console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);

  console.log('\n🎉 AI Decision Logging Test Completed!');
  
  return {
    sessionId,
    totalTests: testResults.length,
    successfulTests: successfulTests.length,
    failedTests: failedTests.length,
    successRate,
    avgDuration,
    results: testResults
  };
}

// 배치 처리 테스트
async function testBatchProcessing() {
  console.log('\n🔄 Testing Batch Processing...\n');

  const batchTasks = [
    {
      id: 'batch1',
      type: 'content-analysis',
      input: {
        content: '자연 친화적인 펜션입니다.',
        storeProfile: testStoreProfile
      }
    },
    {
      id: 'batch2',
      type: 'compliance-check',
      input: {
        content: '자연 친화적인 펜션입니다.',
        storePolicy: testStorePolicy
      }
    },
    {
      id: 'batch3',
      type: 'style-suggestion',
      input: {
        emotion: '따뜻함',
        storeProfile: testStoreProfile,
        targetAudience: '가족'
      }
    }
  ];

  const start = performance.now();
  const batchResults = await aiChainService.batchProcess(batchTasks);
  const end = performance.now();
  const duration = Math.round(end - start);

  console.log(`✅ Batch processing completed in ${duration}ms`);
  console.log(`📊 Processed ${batchResults.length} tasks`);
  
  batchResults.forEach((result, index) => {
    const status = result.result.success ? '✅' : '❌';
    console.log(`  ${status} ${result.id}: ${result.type}`);
  });

  return { batchResults, duration };
}

// 메인 실행 함수
async function main() {
  try {
    console.log('🤖 AI Decision Logging System Test Suite');
    console.log('='.repeat(50));
    
    // 기본 AI 결정 로깅 테스트
    const loggingResults = await testAIDecisionLogging();
    
    // 배치 처리 테스트
    const batchResults = await testBatchProcessing();
    
    // 최종 결과 출력
    console.log('\n🎯 Final Results:');
    console.log('='.repeat(50));
    console.log(`📝 Session ID: ${loggingResults.sessionId}`);
    console.log(`🧪 Total Tests: ${loggingResults.totalTests}`);
    console.log(`✅ Success Rate: ${loggingResults.successRate.toFixed(1)}%`);
    console.log(`⏱️ Avg Duration: ${Math.round(loggingResults.avgDuration)}ms`);
    console.log(`🔄 Batch Processing: ${batchResults.duration}ms for ${batchResults.batchResults.length} tasks`);
    
    // 성공/실패 판정
    const overallSuccess = loggingResults.successRate >= 80;
    console.log(`\n${overallSuccess ? '🎉' : '⚠️'} Overall Status: ${overallSuccess ? 'PASSED' : 'NEEDS ATTENTION'}`);
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testAIDecisionLogging, testBatchProcessing };
