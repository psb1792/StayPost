import { keywordIndex } from '../src/ai/indices/keyword-index.js';
import { hybridSearch } from '../src/ai/retrieval/hybrid-search.js';

async function testKeywordIndex() {
  console.log('=== 연관 단어 데이터베이스 테스트 시작 ===\n');

  try {
    // 1. 기본 초기화 테스트
    console.log('1. 키워드 인덱스 초기화 테스트');
    console.log(`캐시된 단어 수: ${keywordIndex.getCacheSize()}`);
    console.log(`초기화 상태: ${keywordIndex.isInitialized()}`);
    console.log('');

    // 2. 정확한 키워드 검색 테스트
    console.log('2. 정확한 키워드 검색 테스트');
    const searchResults = await keywordIndex.exactKeywordSearch('고요함', 'emotion', 5);
    console.log(`"고요함" 검색 결과:`, searchResults.length);
    searchResults.forEach(result => {
      console.log(`  - ${result.word} (${result.category}): ${result.score}`);
    });
    console.log('');

    // 3. 연관 단어 검색 테스트
    console.log('3. 연관 단어 검색 테스트');
    const relatedWords = await keywordIndex.findRelatedWords('로맨틱', 'emotion', 3);
    console.log(`"로맨틱" 연관 단어:`, relatedWords.length);
    relatedWords.forEach(word => {
      console.log(`  - ${word.word}: ${word.related_words.join(', ')}`);
    });
    console.log('');

    // 4. 감정/톤 기반 추천 테스트
    console.log('4. 감정/톤 기반 추천 테스트');
    const recommendations = await keywordIndex.recommendWordsForEmotion(
      '고요함',
      '정중함',
      ['40대', '50대', '가족'],
      5
    );
    console.log(`추천 단어 수:`, recommendations.length);
    recommendations.forEach(word => {
      console.log(`  - ${word.word} (강도: ${word.intensity}): ${word.usage_context}`);
    });
    console.log('');

    // 5. 금지어 검사 테스트
    console.log('5. 금지어 검사 테스트');
    const testText = '이 펜션은 정말 과장된 광고로 클릭베이트를 유도합니다.';
    const forbiddenWords = await keywordIndex.checkForbiddenWords(testText);
    console.log(`테스트 텍스트: "${testText}"`);
    console.log(`발견된 금지어:`, forbiddenWords);
    console.log('');

    // 6. 새로운 연관 단어 추가 테스트
    console.log('6. 새로운 연관 단어 추가 테스트');
    const newWord = {
      word: '힐링',
      category: 'emotion',
      related_words: ['휴식', '치유', '편안함', '여유'],
      synonyms: ['휴식', '치유', '편안함'],
      antonyms: ['스트레스', '피로', '긴장'],
      usage_context: '힐링 추구 고객, 자연 휴양',
      intensity: 6,
      target_audience: ['힐링 추구 고객', '자연 선호 고객'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await keywordIndex.addRelatedWord(newWord);
    console.log(`새 단어 "${newWord.word}" 추가 완료`);
    console.log(`업데이트된 캐시 크기: ${keywordIndex.getCacheSize()}`);
    console.log('');

    // 7. 하이브리드 검색 테스트
    console.log('7. 하이브리드 검색 테스트');
    const hybridResults = await hybridSearch.search('자연 힐링', {
      limit: 5,
      useHybrid: true
    });
    console.log(`하이브리드 검색 결과:`);
    console.log(`  - 문서 수: ${hybridResults.documents.length}`);
    console.log(`  - 키워드 수: ${hybridResults.keywords.length}`);
    console.log(`  - 통합 점수: ${hybridResults.combined_score.toFixed(3)}`);
    console.log(`  - 검색 타입: ${hybridResults.search_type}`);
    console.log('');

    // 8. 감정/톤 기반 하이브리드 검색 테스트
    console.log('8. 감정/톤 기반 하이브리드 검색 테스트');
    const emotionResults = await hybridSearch.searchByEmotionAndTone(
      '고요함',
      '정중함',
      ['40대', '50대'],
      { limit: 3 }
    );
    console.log(`감정/톤 검색 결과:`);
    console.log(`  - 문서 수: ${emotionResults.documents.length}`);
    console.log(`  - 키워드 수: ${emotionResults.keywords.length}`);
    console.log(`  - 통합 점수: ${emotionResults.combined_score.toFixed(3)}`);
    console.log('');

    // 9. 금지어 검사 및 대안 제안 테스트
    console.log('9. 금지어 검사 및 대안 제안 테스트');
    const complianceCheck = await hybridSearch.checkForbiddenWordsAndSuggest(
      '이 펜션은 정말 과장된 광고로 클릭베이트를 유도합니다.'
    );
    console.log(`금지어 검사 결과:`);
    console.log(`  - 발견된 금지어: ${complianceCheck.forbiddenWords.join(', ')}`);
    console.log(`  - 제안사항: ${complianceCheck.suggestions.length}개`);
    complianceCheck.suggestions.forEach(suggestion => {
      console.log(`    * ${suggestion}`);
    });
    console.log('');

    // 10. 검색 통계 조회
    console.log('10. 검색 통계 조회');
    const stats = hybridSearch.getSearchStats();
    console.log(`검색 통계:`);
    console.log(`  - 벡터 인덱스 크기: ${stats.vectorIndexSize}`);
    console.log(`  - 키워드 인덱스 크기: ${stats.keywordIndexSize}`);
    console.log(`  - 초기화 상태: ${stats.isInitialized}`);
    console.log('');

    console.log('=== 모든 테스트 완료 ===');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
}

// 테스트 실행
testKeywordIndex().catch(console.error);
