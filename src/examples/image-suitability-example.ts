import { ImageSuitabilityChain } from '../ai/chains/image-suitability';
import { AIChainService } from '../ai/services/ai-chain-service';

/**
 * 이미지 적합성 판단 사용 예제
 * 
 * 이 예제는 펜션/숙박업소의 인스타그램 마케팅을 위한 이미지 적합성을 판단하는 방법을 보여줍니다.
 */

// 예제 1: 기본적인 이미지 적합성 판단
async function basicImageSuitabilityCheck() {
  console.log('=== 기본 이미지 적합성 판단 ===');
  
  const chain = new ImageSuitabilityChain();
  
  const input = {
    imageUrl: 'https://example.com/pension-room.jpg',
    storeMeta: {
      name: '산속별장',
      category: '펜션',
      description: '자연 속에서 편안한 휴식을 즐길 수 있는 프리미엄 펜션',
      targetAudience: '커플, 가족, 연인',
      brandTone: '따뜻하고 아늑한',
      location: '강원도 평창'
    },
    context: {
      campaignType: '시즌 프로모션',
      season: '가을',
      specialEvent: '단풍 축제'
    }
  };

  try {
    // Vision 모델을 사용한 상세 분석
    const result = await chain.invokeWithVision(input);
    
    if (result.success) {
      console.log('✅ 분석 완료!');
      console.log('적합성:', result.data.suitable ? '적합' : '부적합');
      console.log('점수:', result.data.score + '/100');
      console.log('문제점:', result.data.issues);
      console.log('제안사항:', result.data.suggestions);
      console.log('상세 분석:', result.data.analysis);
    } else {
      console.log('❌ 분석 실패:', result.error);
    }
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 예제 2: 빠른 체크 (Vision 모델 없이)
async function quickImageCheck() {
  console.log('\n=== 빠른 이미지 체크 ===');
  
  const chain = new ImageSuitabilityChain();
  
  const input = {
    imageUrl: 'https://example.com/pension-exterior.jpg',
    storeMeta: {
      name: '바다뷰 펜션',
      category: '펜션',
      description: '바다를 바라보며 휴식을 취할 수 있는 펜션',
      targetAudience: '커플, 가족',
      brandTone: '로맨틱하고 평화로운',
      location: '부산 해운대'
    }
  };

  try {
    const result = await chain.quickCheck(input);
    
    if (result.success) {
      console.log('✅ 빠른 체크 완료!');
      console.log('적합성:', result.data.suitable ? '적합' : '부적합');
      console.log('이유:', result.data.reason);
    } else {
      console.log('❌ 체크 실패:', result.error);
    }
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 예제 3: AIChainService를 통한 통합 사용
async function integratedImageCheck() {
  console.log('\n=== 통합 서비스를 통한 이미지 체크 ===');
  
  const service = AIChainService.getInstance();
  
  const input = {
    imageUrl: 'https://example.com/pension-garden.jpg',
    storeMeta: {
      name: '정원 펜션',
      category: '펜션',
      description: '아름다운 정원과 함께하는 힐링 펜션',
      targetAudience: '가족, 커플, 단체',
      brandTone: '자연스럽고 편안한',
      location: '경기도 가평'
    },
    context: {
      campaignType: '봄 프로모션',
      season: '봄',
      specialEvent: '벚꽃 축제'
    },
    useVision: true // Vision 모델 사용
  };

  try {
    const result = await service.checkImageSuitability(input);
    
    if (result.success) {
      console.log('✅ 통합 서비스 분석 완료!');
      console.log('적합성:', result.data.suitable ? '적합' : '부적합');
      console.log('점수:', result.data.score + '/100');
      console.log('메타데이터:', {
        모델: result.metadata?.model,
        소요시간: result.metadata?.latency + 'ms',
        재시도횟수: result.metadata?.retryCount
      });
    } else {
      console.log('❌ 분석 실패:', result.error);
    }
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 예제 4: 배치 처리
async function batchImageCheck() {
  console.log('\n=== 배치 이미지 체크 ===');
  
  const service = AIChainService.getInstance();
  
  const tasks = [
    {
      type: 'image-suitability' as const,
      input: {
        imageUrl: 'https://example.com/pension-1.jpg',
        storeMeta: {
          name: '산속별장',
          category: '펜션',
          description: '자연 속 프리미엄 펜션'
        }
      },
      id: 'pension-1'
    },
    {
      type: 'image-suitability' as const,
      input: {
        imageUrl: 'https://example.com/pension-2.jpg',
        storeMeta: {
          name: '바다뷰 펜션',
          category: '펜션',
          description: '바다 전망 펜션'
        }
      },
      id: 'pension-2'
    }
  ];

  try {
    const results = await service.batchProcess(tasks);
    
    console.log('✅ 배치 처리 완료!');
    results.forEach((result, index) => {
      console.log(`\n--- ${result.id} ---`);
      if (result.result.success) {
        console.log('적합성:', result.result.data.suitable ? '적합' : '부적합');
        console.log('점수:', result.result.data.score + '/100');
      } else {
        console.log('실패:', result.result.error);
      }
    });
  } catch (error) {
    console.error('배치 처리 오류:', error);
  }
}

// 예제 5: 다양한 시나리오 테스트
async function scenarioTests() {
  console.log('\n=== 다양한 시나리오 테스트 ===');
  
  const chain = new ImageSuitabilityChain();
  
  const scenarios = [
    {
      name: '고급 펜션',
      input: {
        imageUrl: 'https://example.com/luxury-pension.jpg',
        storeMeta: {
          name: '프리미엄 펜션',
          category: '펜션',
          description: '최고급 시설과 서비스를 제공하는 프리미엄 펜션',
          targetAudience: '고급 고객, 비즈니스 고객',
          brandTone: '고급스럽고 세련된',
          location: '제주도'
        }
      }
    },
    {
      name: '가족형 펜션',
      input: {
        imageUrl: 'https://example.com/family-pension.jpg',
        storeMeta: {
          name: '가족 펜션',
          category: '펜션',
          description: '아이들과 함께 즐길 수 있는 가족형 펜션',
          targetAudience: '가족, 아이들',
          brandTone: '친근하고 즐거운',
          location: '경기도'
        }
      }
    },
    {
      name: '커플 펜션',
      input: {
        imageUrl: 'https://example.com/couple-pension.jpg',
        storeMeta: {
          name: '로맨틱 펜션',
          category: '펜션',
          description: '커플을 위한 로맨틱한 펜션',
          targetAudience: '커플, 연인',
          brandTone: '로맨틱하고 아늑한',
          location: '강원도'
        }
      }
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`);
    
    try {
      const result = await chain.quickCheck(scenario.input);
      
      if (result.success) {
        console.log('적합성:', result.data.suitable ? '적합' : '부적합');
        console.log('이유:', result.data.reason);
      } else {
        console.log('실패:', result.error);
      }
    } catch (error) {
      console.error('오류:', error);
    }
  }
}

// 메인 실행 함수
export async function runImageSuitabilityExamples() {
  console.log('🚀 이미지 적합성 판단 예제 실행 시작\n');
  
  try {
    await basicImageSuitabilityCheck();
    await quickImageCheck();
    await integratedImageCheck();
    await batchImageCheck();
    await scenarioTests();
    
    console.log('\n✅ 모든 예제 실행 완료!');
  } catch (error) {
    console.error('❌ 예제 실행 중 오류 발생:', error);
  }
}

// 직접 실행 시
if (import.meta.env.DEV) {
  runImageSuitabilityExamples();
}
