import { aiChainService } from '../services/ai-chain-service';
import { AIChainResult } from '../chains/base-chain';

// 테스트용 가게 프로필
const testStoreProfile = {
  store_name: '테스트펜션',
  customer_profile: '30~40대 가족 타겟, 자연을 사랑하는 여행객',
  instagram_style: '따뜻하고 편안한 톤, 자연 친화적 분위기',
  tone_preferences: ['따뜻', '편안', '자연스러운']
};

// 테스트용 가게 정책
const testStorePolicy = {
  forbidden_words: ['과장', '거짓', '강요', '최고'],
  required_words: ['자연', '가족', '추억'],
  brand_names: ['테스트펜션'],
  location_names: ['강원도', '춘천']
};

// AI 체인 시스템 테스트
export async function runAIChainSystemTests(): Promise<void> {
  console.log('=== AI Chain System Tests ===');

  try {
    // 1. 체인 초기화 테스트
    console.log('\n1. Testing chain initialization...');
    await aiChainService.initializeAllChains();
    const status = aiChainService.getChainStatus();
    console.log('Chain status:', status);

    // 2. 콘텐츠 분석 테스트
    console.log('\n2. Testing content analysis...');
    const analysisResult = await aiChainService.analyzeContent({
      content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.',
      storeProfile: testStoreProfile,
      imageDescription: '숲속 펜션 전경, 잔잔한 분위기'
    });
    console.log('Content analysis result:', {
      success: analysisResult.success,
      score: analysisResult.data?.suitability_score,
      reasons: analysisResult.data?.reasons?.slice(0, 2)
    });

    // 3. 캡션 생성 테스트
    console.log('\n3. Testing caption generation...');
    const captionResult = await aiChainService.generateCaption({
      imageDescription: '노을 지는 숲속 펜션, 가족들이 함께 있는 따뜻한 분위기',
      storeProfile: testStoreProfile,
      storePolicy: testStorePolicy,
      emotion: '따뜻함',
      targetLength: 'medium'
    });
    console.log('Caption generation result:', {
      success: captionResult.success,
      caption: captionResult.data?.caption?.substring(0, 50) + '...',
      hashtags: captionResult.data?.hashtags?.slice(0, 3)
    });

    // 4. 스타일 제안 테스트
    console.log('\n4. Testing style suggestion...');
    const styleResult = await aiChainService.suggestStyle({
      emotion: '따뜻함',
      storeProfile: testStoreProfile,
      targetAudience: '가족'
    });
    console.log('Style suggestion result:', {
      success: styleResult.success,
      tone: styleResult.data?.recommended_tone,
      keywords: styleResult.data?.keywords?.slice(0, 3)
    });

    // 5. 규정 준수 검사 테스트
    console.log('\n5. Testing compliance check...');
    const complianceResult = await aiChainService.checkCompliance({
      content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 테스트펜션입니다.',
      storePolicy: testStorePolicy,
      storeProfile: testStoreProfile
    });
    console.log('Compliance check result:', {
      success: complianceResult.success,
      compliant: complianceResult.data?.compliant,
      score: complianceResult.data?.compliance_score
    });

    // 6. 빠른 규정 준수 검사 테스트
    console.log('\n6. Testing quick compliance check...');
    const quickCheckResult = aiChainService.quickComplianceCheck(
      '이 펜션은 최고의 시설을 제공합니다.',
      testStorePolicy.forbidden_words || []
    );
    console.log('Quick compliance check result:', quickCheckResult);

    // 7. 배치 처리 테스트
    console.log('\n7. Testing batch processing...');
    const batchResults = await aiChainService.batchProcess([
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
          emotion: '평온함',
          storeProfile: testStoreProfile
        }
      }
    ]);
    console.log('Batch processing result:', {
      totalTasks: batchResults.length,
      successfulTasks: batchResults.filter(r => r.result.success).length,
      failedTasks: batchResults.filter(r => !r.result.success).length
    });

    // 8. 에러 처리 테스트
    console.log('\n8. Testing error handling...');
    const errorResult = await aiChainService.analyzeContent({
      content: '', // 빈 콘텐츠로 에러 유발
      storeProfile: testStoreProfile
    });
    console.log('Error handling result:', {
      success: errorResult.success,
      error: errorResult.error
    });

    console.log('\n=== All AI Chain System Tests Completed ===');

  } catch (error) {
    console.error('AI Chain System Test Error:', error);
  }
}

// 개별 체인 테스트 함수들
export async function testContentAnalysis(): Promise<void> {
  console.log('=== Content Analysis Test ===');
  
  const result = await aiChainService.analyzeContent({
    content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.',
    storeProfile: testStoreProfile,
    imageDescription: '숲속 펜션 전경, 잔잔한 분위기'
  });

  console.log('Result:', {
    success: result.success,
    data: result.data,
    metadata: result.metadata
  });
}

export async function testCaptionGeneration(): Promise<void> {
  console.log('=== Caption Generation Test ===');
  
  const result = await aiChainService.generateCaption({
    imageDescription: '노을 지는 숲속 펜션, 가족들이 함께 있는 따뜻한 분위기',
    storeProfile: testStoreProfile,
    storePolicy: testStorePolicy,
    emotion: '따뜻함',
    targetLength: 'medium'
  });

  console.log('Result:', {
    success: result.success,
    data: result.data,
    metadata: result.metadata
  });
}

export async function testStyleSuggestion(): Promise<void> {
  console.log('=== Style Suggestion Test ===');
  
  const result = await aiChainService.suggestStyle({
    emotion: '따뜻함',
    storeProfile: testStoreProfile,
    targetAudience: '가족'
  });

  console.log('Result:', {
    success: result.success,
    data: result.data,
    metadata: result.metadata
  });
}

export async function testComplianceCheck(): Promise<void> {
  console.log('=== Compliance Check Test ===');
  
  const result = await aiChainService.checkCompliance({
    content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 테스트펜션입니다.',
    storePolicy: testStorePolicy,
    storeProfile: testStoreProfile
  });

  console.log('Result:', {
    success: result.success,
    data: result.data,
    metadata: result.metadata
  });
}
