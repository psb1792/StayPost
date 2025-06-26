/**
 * StayPost 이미지 메타데이터 기반 패턴 선택 로직
 * 조건 분기를 통해 최적의 콘텐츠 패턴을 결정합니다.
 */

import { PatternKey } from './patternTemplates';

// 이미지 메타데이터 타입 정의
export interface ImageMeta {
  main_features: string[];
  view_type: string;
  emotions: string[];
  hashtags?: string[]; // 선택적 필드
}

// 패턴 선택 조건 인터페이스
interface PatternCondition {
  key: PatternKey;
  name: string;
  priority: number; // 우선순위 (낮을수록 높은 우선순위)
  condition: (meta: ImageMeta) => boolean;
  description: string;
}

// 🎯 패턴 선택 조건 정의 (우선순위 순서)
const patternConditions: PatternCondition[] = [
  // 1순위: 오션뷰 + 노을 (가장 구체적인 조건)
  {
    key: 'ocean_sunset',
    name: '오션뷰 노을 감성',
    priority: 1,
    condition: (meta) => {
      const hasOceanView = meta.view_type.includes('오션') || meta.view_type.includes('바다');
      const hasSunset = meta.main_features.some(f => 
        f.includes('노을') || f.includes('석양') || f.includes('일몰')
      );
      const hasOceanFeature = meta.main_features.some(f => 
        f.includes('바다') || f.includes('해변') || f.includes('오션')
      );
      
      return hasOceanView && (hasSunset || hasOceanFeature);
    },
    description: '오션뷰 + 노을/바다 특징'
  },

  // 2순위: 풀빌라 + 럭셔리
  {
    key: 'luxury_poolvilla',
    name: '럭셔리 풀빌라',
    priority: 2,
    condition: (meta) => {
      const hasPool = meta.main_features.some(f => 
        f.includes('수영장') || f.includes('풀') || f.includes('pool')
      );
      const hasLuxury = meta.emotions.some(e => 
        e.includes('럭셔리') || e.includes('고급') || e.includes('프리미엄')
      );
      
      return hasPool && hasLuxury;
    },
    description: '수영장/풀 + 럭셔리 감성'
  },

  // 3순위: 가족 친화 (키즈 관련)
  {
    key: 'family_friendly',
    name: '가족 친화형',
    priority: 3,
    condition: (meta) => {
      const hasKidsFeature = meta.main_features.some(f => 
        f.includes('키즈') || f.includes('놀이') || f.includes('미끄럼틀') || 
        f.includes('어린이') || f.includes('아이')
      );
      const hasFamilyEmotion = meta.emotions.some(e => 
        e.includes('가족') || e.includes('패밀리')
      );
      
      return hasKidsFeature || hasFamilyEmotion;
    },
    description: '키즈/놀이 시설 또는 가족 감성'
  },

  // 4순위: 로맨틱 커플
  {
    key: 'romantic_couple',
    name: '로맨틱 커플',
    priority: 4,
    condition: (meta) => {
      const hasRomanticFeature = meta.main_features.some(f => 
        f.includes('자쿠지') || f.includes('테라스') || f.includes('발코니') ||
        f.includes('캔들') || f.includes('와인')
      );
      const hasRomanticEmotion = meta.emotions.some(e => 
        e.includes('로맨틱') || e.includes('커플') || e.includes('사랑')
      );
      
      return hasRomanticFeature || hasRomanticEmotion;
    },
    description: '자쿠지/테라스 또는 로맨틱 감성'
  },

  // 5순위: 자연 힐링
  {
    key: 'healing_garden',
    name: '자연 힐링',
    priority: 5,
    condition: (meta) => {
      const hasNatureFeature = meta.main_features.some(f => 
        f.includes('정원') || f.includes('산') || f.includes('숲') || 
        f.includes('나무') || f.includes('꽃') || f.includes('자연')
      );
      const hasHealingEmotion = meta.emotions.some(e => 
        e.includes('힐링') || e.includes('치유') || e.includes('고요') || 
        e.includes('평온') || e.includes('휴식')
      );
      const hasNatureView = meta.view_type.includes('가든') || 
        meta.view_type.includes('마운틴') || meta.view_type.includes('포레스트');
      
      return hasNatureFeature || hasHealingEmotion || hasNatureView;
    },
    description: '정원/산/숲 특징 또는 힐링 감성'
  },

  // 6순위: 모던 건축
  {
    key: 'modern_architecture',
    name: '모던 건축',
    priority: 6,
    condition: (meta) => {
      const hasModernFeature = meta.main_features.some(f => 
        f.includes('모던') || f.includes('현대') || f.includes('디자인') ||
        f.includes('건축') || f.includes('인테리어')
      );
      const hasModernEmotion = meta.emotions.some(e => 
        e.includes('모던') || e.includes('세련') || e.includes('스타일리시') ||
        e.includes('트렌디') || e.includes('현대적')
      );
      
      return hasModernFeature || hasModernEmotion;
    },
    description: '모던/디자인 특징 또는 세련된 감성'
  },

  // 7순위: 야간 조명
  {
    key: 'night_lighting',
    name: '야간 조명',
    priority: 7,
    condition: (meta) => {
      const hasLightingFeature = meta.main_features.some(f => 
        f.includes('조명') || f.includes('라이트') || f.includes('야경') ||
        f.includes('밤') || f.includes('LED')
      );
      const hasNightEmotion = meta.emotions.some(e => 
        e.includes('야경') || e.includes('조명') || e.includes('밤')
      );
      
      return hasLightingFeature || hasNightEmotion;
    },
    description: '조명/야경 특징'
  },

  // 8순위: 시골 평화
  {
    key: 'rural_peace',
    name: '시골 평화',
    priority: 8,
    condition: (meta) => {
      const hasRuralFeature = meta.main_features.some(f => 
        f.includes('논') || f.includes('밭') || f.includes('시골') ||
        f.includes('전원') || f.includes('농촌')
      );
      const hasRuralView = meta.view_type.includes('논뷰') || 
        meta.view_type.includes('전원') || meta.view_type.includes('시골');
      const hasPeacefulEmotion = meta.emotions.some(e => 
        e.includes('평화') || e.includes('전원') || e.includes('시골')
      );
      
      return hasRuralFeature || hasRuralView || hasPeacefulEmotion;
    },
    description: '논/밭/시골 특징 또는 전원 감성'
  },

  // 9순위: 미니멀 자연
  {
    key: 'minimalist_nature',
    name: '미니멀 자연',
    priority: 9,
    condition: (meta) => {
      const hasMinimalFeature = meta.main_features.some(f => 
        f.includes('미니멀') || f.includes('심플') || f.includes('깔끔')
      );
      const hasMinimalEmotion = meta.emotions.some(e => 
        e.includes('미니멀') || e.includes('심플') || e.includes('깔끔') ||
        e.includes('단순') || e.includes('정적')
      );
      
      return hasMinimalFeature || hasMinimalEmotion;
    },
    description: '미니멀/심플 특징 또는 감성'
  },

  // 10순위: SNS 트렌딩 (인스타 관련)
  {
    key: 'trending_insta',
    name: 'SNS 트렌딩',
    priority: 10,
    condition: (meta) => {
      const hasInstagramFeature = meta.main_features.some(f => 
        f.includes('포토존') || f.includes('인스타') || f.includes('사진') ||
        f.includes('감성') || f.includes('트렌드')
      );
      const hasInstagramEmotion = meta.emotions.some(e => 
        e.includes('인스타') || e.includes('감성') || e.includes('트렌디') ||
        e.includes('포토') || e.includes('SNS')
      );
      
      return hasInstagramFeature || hasInstagramEmotion;
    },
    description: '포토존/인스타 특징 또는 감성'
  }
];

/**
 * 이미지 메타데이터를 기반으로 최적의 패턴을 선택합니다.
 * 
 * @param meta - 이미지 메타데이터
 * @returns 선택된 패턴 키
 */
export function selectPattern(meta: ImageMeta): PatternKey {
  // 입력 데이터 검증
  if (!meta || !meta.main_features || !meta.view_type || !meta.emotions) {
    console.warn('Invalid meta data provided, using default pattern');
    return 'trending_insta'; // 기본 패턴
  }

  // 조건을 만족하는 패턴들을 우선순위 순으로 찾기
  const matchingPatterns = patternConditions
    .filter(condition => {
      try {
        return condition.condition(meta);
      } catch (error) {
        console.error(`Error evaluating condition for ${condition.key}:`, error);
        return false;
      }
    })
    .sort((a, b) => a.priority - b.priority);

  // 매칭되는 패턴이 있으면 가장 높은 우선순위 패턴 반환
  if (matchingPatterns.length > 0) {
    const selectedPattern = matchingPatterns[0];
    console.log(`Selected pattern: ${selectedPattern.name} (${selectedPattern.key})`);
    console.log(`Reason: ${selectedPattern.description}`);
    return selectedPattern.key;
  }

  // 매칭되는 패턴이 없으면 기본 패턴 반환
  console.log('No specific pattern matched, using default trending_insta pattern');
  return 'trending_insta';
}

/**
 * 패턴 선택 과정의 상세 정보를 반환합니다.
 * 디버깅 및 분석 용도로 사용됩니다.
 * 
 * @param meta - 이미지 메타데이터
 * @returns 패턴 선택 상세 정보
 */
export function getPatternSelectionDetails(meta: ImageMeta) {
  const results = patternConditions.map(condition => ({
    key: condition.key,
    name: condition.name,
    priority: condition.priority,
    matched: condition.condition(meta),
    description: condition.description
  }));

  const matchedPatterns = results.filter(r => r.matched);
  const selectedPattern = matchedPatterns.length > 0 
    ? matchedPatterns.sort((a, b) => a.priority - b.priority)[0]
    : results.find(r => r.key === 'trending_insta');

  return {
    selectedPattern: selectedPattern?.key || 'trending_insta',
    selectedPatternName: selectedPattern?.name || 'SNS 트렌딩',
    matchedPatterns,
    allResults: results,
    meta
  };
}

/**
 * 특정 패턴의 조건을 테스트합니다.
 * 
 * @param patternKey - 테스트할 패턴 키
 * @param meta - 이미지 메타데이터
 * @returns 조건 만족 여부
 */
export function testPatternCondition(patternKey: PatternKey, meta: ImageMeta): boolean {
  const condition = patternConditions.find(c => c.key === patternKey);
  if (!condition) {
    console.error(`Pattern condition not found: ${patternKey}`);
    return false;
  }
  
  try {
    return condition.condition(meta);
  } catch (error) {
    console.error(`Error testing pattern condition for ${patternKey}:`, error);
    return false;
  }
}

// 패턴 조건 정보 조회 (디버깅용)
export function getPatternConditions() {
  return patternConditions.map(({ condition, ...rest }) => rest);
}