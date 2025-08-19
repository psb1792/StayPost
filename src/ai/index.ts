// AI 시스템 메인 진입점
export * from './clients';
export * from './types/store';
export * from './indices';
export * from './retrieval';
export * from './services/store-service';
export * from './utils/initializer';
export * from './test/store-system.test';
export * from './test/ai-chain-system.test';

// AI 호출 통합 시스템
export * from './chains';
export * from './services/ai-chain-service';
export * from './services/ai-decision-logger';

// 2단계 AI 파이프라인 시스템
export * from './services/ai-pipeline-service';

// AI 시스템 초기화 함수
export async function initializeAISystem(): Promise<void> {
  const { AIInitializer } = await import('./utils/initializer');
  await AIInitializer.initialize();
}

// AI 시스템 사용 예시
export async function exampleUsage(): Promise<void> {
  const { storeService } = await import('./services/store-service');
  const { aiChainService } = await import('./services/ai-chain-service');
  
  // 1. 가게 프로필 저장
  const profile = {
    store_slug: 'example-pension',
    store_name: '예시펜션',
    customer_profile: '30~40대 가족 타겟, 자연을 사랑하는 여행객',
    instagram_style: '따뜻하고 편안한 톤, 자연 친화적 분위기',
    pension_introduction: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.',
  };

  const profileResult = await storeService.saveStoreProfile(profile);
  console.log('Profile saved:', profileResult.success);

  // 2. 가게 정책 저장
  const policy = {
    store_slug: 'example-pension',
    forbidden_words: ['과장', '거짓', '강요'],
    required_words: ['자연', '가족', '추억'],
    brand_names: ['예시펜션'],
    location_names: ['강원도', '춘천'],
    tone_preferences: ['따뜻', '편안', '자연스러운'],
    target_audience: ['가족', '30대', '40대']
  };

  const policyResult = await storeService.saveStorePolicy(policy);
  console.log('Policy saved:', policyResult.success);

  // 3. AI 체인 서비스 사용 예시
  console.log('=== AI Chain Service Examples ===');

  // 3-1. 콘텐츠 분석
  const analysisResult = await aiChainService.analyzeContent({
    content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.',
    storeProfile: profile,
    imageDescription: '숲속 펜션 전경, 잔잔한 분위기'
  });
  console.log('Content analysis:', analysisResult.success ? analysisResult.data?.suitability_score : analysisResult.error);

  // 3-2. 캡션 생성
  const captionResult = await aiChainService.generateCaption({
    imageDescription: '노을 지는 숲속 펜션, 가족들이 함께 있는 따뜻한 분위기',
    storeProfile: profile,
    storePolicy: policy,
    emotion: '따뜻함',
    targetLength: 'medium'
  });
  console.log('Caption generation:', captionResult.success ? captionResult.data?.caption : captionResult.error);

  // 3-3. 스타일 제안
  const styleResult = await aiChainService.suggestStyle({
    emotion: '따뜻함',
    storeProfile: profile,
    targetAudience: '가족'
  });
  console.log('Style suggestion:', styleResult.success ? styleResult.data?.recommended_tone : styleResult.error);

  // 3-4. 규정 준수 검사
  const complianceResult = await aiChainService.checkCompliance({
    content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 예시펜션입니다.',
    storePolicy: policy,
    storeProfile: profile
  });
  console.log('Compliance check:', complianceResult.success ? complianceResult.data?.compliant : complianceResult.error);

  // 3-5. 이미지 적합성 판단
  const imageResult = await aiChainService.checkImageSuitability({
    imageUrl: 'https://example.com/pension-room.jpg',
    storeMeta: {
      name: '예시펜션',
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
    useVision: false // 빠른 체크
  });
  console.log('Image suitability:', imageResult.success ? imageResult.data?.suitable : imageResult.error);

  // 3-6. 배치 처리 예시
  const batchResults = await aiChainService.batchProcess([
    {
      id: 'task1',
      type: 'content-analysis',
      input: {
        content: '자연 친화적인 펜션입니다.',
        storeProfile: profile
      }
    },
    {
      id: 'task2', 
      type: 'compliance-check',
      input: {
        content: '자연 친화적인 펜션입니다.',
        storePolicy: policy
      }
    }
  ]);
  console.log('Batch processing completed:', batchResults.length, 'tasks');

  // 4. 가게 정보 조회
  const storeInfo = await storeService.getStoreInfo('example-pension');
  console.log('Store info retrieved:', storeInfo.success);

  // 5. 검색 기능 사용
  const searchResults = await storeService.searchStores('자연 친화적', 3);
  console.log('Search results:', searchResults.data?.length || 0);
}

// AI 시스템 상태 확인
export async function checkAISystemStatus(): Promise<{
  vectorIndex: boolean;
  database: boolean;
  embeddings: boolean;
}> {
  const { AIInitializer } = await import('./utils/initializer');
  return await AIInitializer.checkSystemStatus();
}

// 테스트 실행
export async function runTests(): Promise<void> {
  const { runStoreSystemTests } = await import('./test/store-system.test');
  const { runAIChainSystemTests } = await import('./test/ai-chain-system.test');
  
  console.log('Running Store System Tests...');
  await runStoreSystemTests();
  
  console.log('\nRunning AI Chain System Tests...');
  await runAIChainSystemTests();
}

// 개별 테스트 함수들
export async function testImageSuitability(apiKey: string): Promise<void> {
  const { ImageSuitabilityChain } = await import('./chains/image-suitability');
  const chain = new ImageSuitabilityChain(apiKey);
  
  console.log('Testing Image Suitability Chain...');
  
  const testInput = {
    imageUrl: 'https://example.com/test-pension.jpg',
    storeMeta: {
      name: '테스트 펜션',
      category: '펜션',
      description: '테스트용 펜션',
      targetAudience: '테스트 고객',
      brandTone: '테스트 톤',
      location: '테스트 지역'
    }
  };

  try {
    const result = await chain.quickCheck(testInput);
    console.log('Quick check result:', result.success ? 'Success' : 'Failed');
    if (result.success) {
      console.log('Suitability:', result.data?.suitable);
      console.log('Reason:', result.data?.reason);
    }
  } catch (error) {
    console.error('Image suitability test failed:', error);
  }
}
