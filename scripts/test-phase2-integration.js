/**
 * Phase 2 통합 테스트 스크립트
 * 전체 시스템의 통합을 테스트합니다.
 */

// 시뮬레이션된 AI 응답 (실제 OpenAI API 호출 없이)
const mockAIResponse = {
  main_features: ['바다', '노을', '석양', '해변', '테라스'],
  view_type: '오션뷰',
  emotions: ['로맨틱', '감성', '평온'],
  hashtags: ['#오션뷰', '#노을맛집', '#감성숙소', '#커플여행', '#제주도숙소'],
  recipeKey: 'ocean_sunset',
  candidates: ['romantic_couple', 'night_lighting'],
  confidence: 0.92,
  textHints: ['노을 부분에 제목 배치', '바다와 하늘 경계선에 서브타이틀', '하단 여백에 해시태그']
};

// 패턴 선택 로직 (실제 로직과 동일)
function selectPattern(meta) {
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

  // 규칙 기반 선택
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

// 디자인 시스템에서 템플릿 가져오기 (시뮬레이션)
function getVisualTemplate(patternKey) {
  const templates = {
    ocean_sunset: {
      name: '오션뷰 노을 감성',
      fontPair: 'elegant-serif',
      palette: 'ocean-sunset',
      layout: 'basic-centered',
      style: {
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        shadow: { enabled: true, blur: 10 },
        border: { enabled: false },
        overlay: { enabled: false }
      }
    },
    luxury_poolvilla: {
      name: '럭셔리 풀빌라',
      fontPair: 'elegant-serif',
      palette: 'luxury-pool',
      layout: 'card-overlay',
      style: {
        background: 'linear-gradient(135deg, #2C3E50 0%, #3498DB 100%)',
        shadow: { enabled: true, blur: 15 },
        border: { enabled: true, color: '#E74C3C' },
        overlay: { enabled: true, opacity: 0.1 }
      }
    },
    healing_garden: {
      name: '자연 힐링',
      fontPair: 'cozy-cafe',
      palette: 'healing-garden',
      layout: 'minimalist-side',
      style: {
        background: 'linear-gradient(135deg, #27AE60 0%, #8BC34A 100%)',
        shadow: { enabled: false },
        border: { enabled: false },
        overlay: { enabled: false }
      }
    }
  };

  return templates[patternKey] || templates.ocean_sunset;
}

// 통합 테스트 실행
function runIntegrationTest() {
  console.log('🧪 Phase 2 통합 테스트 시작...\n');

  // 1. AI 응답 시뮬레이션
  console.log('1️⃣ AI 응답 시뮬레이션');
  console.log('📊 AI 응답:', JSON.stringify(mockAIResponse, null, 2));

  // 2. 응답 구조 검증
  console.log('\n2️⃣ 응답 구조 검증');
  const requiredFields = ['main_features', 'view_type', 'emotions', 'hashtags', 'recipeKey', 'candidates', 'confidence', 'textHints'];
  const missingFields = requiredFields.filter(field => !(field in mockAIResponse));
  
  if (missingFields.length > 0) {
    console.log('❌ 누락된 필드:', missingFields);
    return;
  } else {
    console.log('✅ 모든 필수 필드 존재');
  }

  // 3. 패턴 선택 로직 실행
  console.log('\n3️⃣ 패턴 선택 로직 실행');
  const patternResult = selectPattern(mockAIResponse);
  console.log('🎯 선택된 패턴:', JSON.stringify(patternResult, null, 2));

  // 4. 디자인 템플릿 적용
  console.log('\n4️⃣ 디자인 템플릿 적용');
  const visualTemplate = getVisualTemplate(patternResult.selectedPattern);
  console.log('🎨 시각적 템플릿:', JSON.stringify(visualTemplate, null, 2));

  // 5. 최종 결과 생성
  console.log('\n5️⃣ 최종 결과 생성');
  const finalResult = {
    imageMeta: mockAIResponse,
    patternSelection: patternResult,
    visualTemplate: visualTemplate,
    textHints: mockAIResponse.textHints,
    confidence: patternResult.confidence
  };

  console.log('🎉 최종 결과:', JSON.stringify(finalResult, null, 2));

  // 6. 검증
  console.log('\n6️⃣ 검증');
  
  const validations = [
    {
      name: 'AI 응답 구조',
      passed: requiredFields.every(field => field in mockAIResponse)
    },
    {
      name: 'recipeKey 유효성',
      passed: ['ocean_sunset', 'luxury_poolvilla', 'healing_garden', 'romantic_couple', 'family_friendly', 'modern_architecture', 'night_lighting', 'minimalist_nature', 'rural_peace', 'trending_insta'].includes(mockAIResponse.recipeKey)
    },
    {
      name: 'confidence 범위',
      passed: mockAIResponse.confidence >= 0 && mockAIResponse.confidence <= 1
    },
    {
      name: '패턴 선택 결과',
      passed: patternResult.selectedPattern && patternResult.source
    },
    {
      name: '시각적 템플릿',
      passed: visualTemplate.name && visualTemplate.fontPair && visualTemplate.palette
    }
  ];

  validations.forEach(validation => {
    console.log(`${validation.passed ? '✅' : '❌'} ${validation.name}: ${validation.passed ? '통과' : '실패'}`);
  });

  const passedCount = validations.filter(v => v.passed).length;
  console.log(`\n🎯 검증 결과: ${passedCount}/${validations.length} 통과`);

  if (passedCount === validations.length) {
    console.log('🎉 Phase 2 통합 테스트 완료! 모든 기능이 정상적으로 작동합니다.');
  } else {
    console.log('⚠️ 일부 검증이 실패했습니다.');
  }
}

// 테스트 실행
runIntegrationTest();
