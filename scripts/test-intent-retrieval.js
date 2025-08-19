import dotenv from 'dotenv';
import { IntentRetrievalChain } from '../src/ai/chains/intent-retrieval-chain.js';

// 환경 변수 로드
dotenv.config();

async function testIntentRetrieval() {
  console.log('🧪 의도 파싱 + Self-Query Retriever 통합 테스트 시작\n');

  try {
    // API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
    }

    // 체인 생성
    const chain = new IntentRetrievalChain(apiKey);

    // 테스트 케이스들
    const testCases = [
      {
        name: '여름 팥빙수 홍보',
        input: {
          userRequest: '우리 동네 팥빙수 축제를 홍보하고 싶어요. 사진 없이 글만 가지고 시원하고 경쾌한 느낌으로 만들어주세요.',
          context: '음식점 업종, 여름 시즌',
          availableFilters: ['season', 'purpose', 'style', 'hasImage', 'category']
        }
      },
      {
        name: '가을 감성 카페',
        input: {
          userRequest: '가을 분위기의 감성 카페를 소개하는 글을 써주세요. 따뜻하고 차분한 톤으로요.',
          context: '카페 업종, 가을 시즌',
          availableFilters: ['season', 'purpose', 'style', 'tone', 'category']
        }
      },
      {
        name: '겨울 숙박 시설',
        input: {
          userRequest: '겨울에 방문하기 좋은 펜션을 홍보하는 인스타그램 포스트를 만들어주세요. 포근하고 따뜻한 느낌으로요.',
          context: '숙박 업종, 겨울 시즌',
          availableFilters: ['season', 'purpose', 'style', 'category', 'targetAudience']
        }
      }
    ];

    // 각 테스트 케이스 실행
    for (const testCase of testCases) {
      console.log(`📝 테스트: ${testCase.name}`);
      console.log(`입력: ${testCase.input.userRequest}\n`);

      try {
        // 통합 분석 및 검색 수행
        const result = await chain.analyzeAndRetrieve(testCase.input);

        if (result.success && result.data) {
          const { intent, retrieval, confidence } = result.data;

          console.log('✅ 의도 분석 결과:');
          console.log(`  - 의도: ${intent.intent}`);
          console.log(`  - 엔티티: ${intent.entities.join(', ')}`);
          console.log(`  - 신뢰도: ${intent.confidence}`);
          console.log(`  - 파라미터:`, intent.parameters);

          console.log('\n🔍 검색 결과:');
          console.log(`  - 검색 쿼리: ${retrieval.query.searchQuery}`);
          console.log(`  - 필터:`, retrieval.query.filters);
          console.log(`  - 검색 근거: ${retrieval.query.reasoning}`);
          console.log(`  - 검색 신뢰도: ${retrieval.query.confidence}`);
          console.log(`  - 검색 결과 수: ${retrieval.results.length}`);

          if (retrieval.results.length > 0) {
            console.log('\n📋 검색된 문서들:');
            retrieval.results.slice(0, 3).forEach((result, index) => {
              console.log(`  ${index + 1}. [${result.type}] ${result.content.substring(0, 100)}...`);
              console.log(`     스코어: ${result.score}, 소스: ${result.source}`);
            });
          }

          console.log(`\n🎯 전체 신뢰도: ${confidence}`);
        } else {
          console.log('❌ 실패:', result.error);
        }

      } catch (error) {
        console.log('❌ 오류:', error.message);
      }

      console.log('\n' + '='.repeat(80) + '\n');
    }

    // 개별 기능 테스트
    console.log('🔧 개별 기능 테스트\n');

    // 의도 파싱만 테스트
    console.log('📊 의도 파싱만 테스트:');
    const intentResult = await chain.parseIntent({
      userRequest: '봄 벚꽃 축제를 홍보하는 글을 써주세요',
      context: '이벤트 업종'
    });

    if (intentResult.success) {
      console.log('✅ 의도 파싱 성공:', intentResult.data);
    } else {
      console.log('❌ 의도 파싱 실패:', intentResult.error);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // 검색만 테스트
    console.log('🔍 검색만 테스트:');
    const searchResult = await chain.retrieve({
      userRequest: '시원한 여름 음식점 홍보',
      availableFilters: ['season', 'purpose', 'category']
    });

    if (searchResult.success) {
      console.log('✅ 검색 성공');
      console.log(`검색 결과 수: ${searchResult.results?.length || 0}`);
      console.log('검색 쿼리:', searchResult.query);
    } else {
      console.log('❌ 검색 실패:', searchResult.error);
    }

  } catch (error) {
    console.error('💥 테스트 실행 중 오류:', error);
  }
}

// 테스트 실행
testIntentRetrieval().then(() => {
  console.log('🏁 테스트 완료');
}).catch(error => {
  console.error('💥 테스트 실패:', error);
  process.exit(1);
});
