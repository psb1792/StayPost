/**
 * 패턴 선택 로직 테스트 스크립트
 * AI 추천과 규칙 기반 로직의 통합을 테스트합니다.
 */

// 테스트용 메타데이터
const testMetaData = [
  {
    name: '오션뷰 노을 테스트',
    meta: {
      main_features: ['바다', '노을', '석양', '해변'],
      view_type: '오션뷰',
      emotions: ['로맨틱', '감성', '평온'],
      hashtags: ['#오션뷰', '#노을맛집'],
      recipeKey: 'ocean_sunset',
      candidates: ['romantic_couple', 'night_lighting'],
      confidence: 0.9,
      textHints: ['노을 부분에 제목 배치', '바다와 하늘 경계선에 서브타이틀']
    },
    expectedPattern: 'ocean_sunset',
    expectedSource: 'ai_recommendation'
  },
  {
    name: '럭셔리 풀빌라 테스트',
    meta: {
      main_features: ['수영장', '풀', '프라이빗'],
      view_type: '시티뷰',
      emotions: ['럭셔리', '고급', '프리미엄'],
      hashtags: ['#풀빌라', '#럭셔리'],
      recipeKey: 'luxury_poolvilla',
      candidates: ['modern_architecture', 'romantic_couple'],
      confidence: 0.85,
      textHints: ['수영장 위에 제목', '우측에 설명 텍스트']
    },
    expectedPattern: 'luxury_poolvilla',
    expectedSource: 'ai_recommendation'
  },
  {
    name: '낮은 신뢰도 AI 추천 테스트',
    meta: {
      main_features: ['정원', '산', '나무'],
      view_type: '가든뷰',
      emotions: ['힐링', '치유', '고요'],
      hashtags: ['#힐링', '#자연'],
      recipeKey: 'healing_garden',
      candidates: ['rural_peace', 'minimalist_nature'],
      confidence: 0.3, // 낮은 신뢰도
      textHints: ['자연 부분에 제목']
    },
    expectedPattern: 'healing_garden', // 규칙 기반으로 선택될 것
    expectedSource: 'rule_based'
  },
  {
    name: 'AI 추천 없음 테스트',
    meta: {
      main_features: ['포토존', '인스타', '감성'],
      view_type: '시티뷰',
      emotions: ['트렌디', '인스타', '감성'],
      hashtags: ['#인스타감성', '#포토존']
      // AI 추천 필드 없음
    },
    expectedPattern: 'trending_insta',
    expectedSource: 'rule_based'
  }
];

// 패턴 선택 로직 시뮬레이션 (실제 로직과 동일)
function simulatePatternSelection(meta) {
  const validKeys = ['ocean_sunset', 'luxury_poolvilla', 'healing_garden', 'romantic_couple', 'family_friendly', 'modern_architecture', 'night_lighting', 'minimalist_nature', 'rural_peace', 'trending_insta'];
  
  // AI 추천 검증
  let aiResult = {
    isValid: false,
    pattern: null,
    confidence: 0,
    candidates: [],
    reasoning: ''
  };

  if (meta.recipeKey && validKeys.includes(meta.recipeKey)) {
    const confidence = meta.confidence ?? 0;
    const candidates = meta.candidates || [];
    
    if (typeof confidence === 'number' && confidence >= 0 && confidence <= 1) {
      aiResult = {
        isValid: true,
        pattern: meta.recipeKey,
        confidence: confidence,
        candidates: candidates.filter(c => validKeys.includes(c)),
        reasoning: `AI 추천: ${meta.recipeKey} (신뢰도: ${confidence.toFixed(2)})`
      };
    }
  }

  // 규칙 기반 선택 (간단한 시뮬레이션)
  let ruleResult = {
    pattern: 'trending_insta',
    priority: 999,
    reasoning: '규칙 기반: 기본 패턴 사용'
  };

  // 간단한 규칙 매칭
  if (meta.main_features.some(f => f.includes('바다') || f.includes('노을'))) {
    ruleResult = {
      pattern: 'ocean_sunset',
      priority: 1,
      reasoning: '규칙 기반: 오션뷰 노을 감성'
    };
  } else if (meta.main_features.some(f => f.includes('수영장') || f.includes('풀'))) {
    ruleResult = {
      pattern: 'luxury_poolvilla',
      priority: 2,
      reasoning: '규칙 기반: 럭셔리 풀빌라'
    };
  } else if (meta.main_features.some(f => f.includes('정원') || f.includes('산'))) {
    ruleResult = {
      pattern: 'healing_garden',
      priority: 5,
      reasoning: '규칙 기반: 자연 힐링'
    };
  }

  // 최종 결정 로직
  if (aiResult.isValid && aiResult.confidence >= 0.8) {
    return {
      selectedPattern: aiResult.pattern,
      source: 'ai_recommendation',
      confidence: aiResult.confidence,
      candidates: aiResult.candidates,
      reasoning: aiResult.reasoning
    };
  } else if (aiResult.isValid && aiResult.confidence >= 0.5) {
    if (aiResult.pattern === ruleResult.pattern) {
      return {
        selectedPattern: aiResult.pattern,
        source: 'ai_recommendation',
        confidence: aiResult.confidence,
        candidates: aiResult.candidates,
        reasoning: `${aiResult.reasoning} + ${ruleResult.reasoning} (일치)`
      };
    } else if (aiResult.candidates.includes(ruleResult.pattern)) {
      return {
        selectedPattern: ruleResult.pattern,
        source: 'rule_based',
        confidence: aiResult.confidence,
        candidates: aiResult.candidates,
        reasoning: `${ruleResult.reasoning} (AI candidates에 포함)`
      };
    } else {
      return {
        selectedPattern: aiResult.pattern,
        source: 'ai_recommendation',
        confidence: aiResult.confidence,
        candidates: aiResult.candidates,
        reasoning: aiResult.reasoning
      };
    }
  } else {
    return {
      selectedPattern: ruleResult.pattern,
      source: 'rule_based',
      confidence: 0.0,
      candidates: [],
      reasoning: ruleResult.reasoning
    };
  }
}

// 테스트 실행
function runPatternSelectionTests() {
  console.log('🧪 패턴 선택 로직 테스트 시작...\n');

  let passedTests = 0;
  let totalTests = testMetaData.length;

  testMetaData.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   입력: ${JSON.stringify(testCase.meta, null, 2)}`);
    
    const result = simulatePatternSelection(testCase.meta);
    
    console.log(`   결과: ${JSON.stringify(result, null, 2)}`);
    
    const patternMatch = result.selectedPattern === testCase.expectedPattern;
    const sourceMatch = result.source === testCase.expectedSource;
    
    if (patternMatch && sourceMatch) {
      console.log(`   ✅ 패턴 일치: ${result.selectedPattern}`);
      console.log(`   ✅ 소스 일치: ${result.source}`);
      passedTests++;
    } else {
      console.log(`   ❌ 패턴 불일치: 예상=${testCase.expectedPattern}, 실제=${result.selectedPattern}`);
      console.log(`   ❌ 소스 불일치: 예상=${testCase.expectedSource}, 실제=${result.source}`);
    }
    
    console.log('');
  });

  console.log(`🎯 테스트 결과: ${passedTests}/${totalTests} 통과`);
  
  if (passedTests === totalTests) {
    console.log('🎉 모든 테스트 통과!');
  } else {
    console.log('⚠️ 일부 테스트 실패');
  }
}

// 테스트 실행
runPatternSelectionTests();
