import { IntentParsingChain } from '../chains/intent-parsing';
import { CaptionGenerationChain } from '../chains/caption-generation';
import { routerQueryEngine } from '../retrieval/router-query-engine';

// 테스트용 가게 프로필
const testStoreProfile = {
  store_name: '스테이포스트 펜션',
  customer_profile: '30-40대 커플, 가족',
  instagram_style: '따뜻하고 아늑한 분위기',
  tone_preferences: ['친근함', '따뜻함']
};

// 테스트용 가게 정책
const testStorePolicy = {
  forbidden_words: ['싸다', '저렴하다', '할인'],
  required_words: ['스테이포스트', '펜션'],
  brand_names: ['스테이포스트']
};

describe('Phase 2.3 3단계: 사용자 요청 기반 문구 생성', () => {
  let intentParser: IntentParsingChain;
  let captionGenerator: CaptionGenerationChain;

  beforeAll(async () => {
    intentParser = new IntentParsingChain();
    captionGenerator = new CaptionGenerationChain();
  });

  describe('1단계: 사용자 의도 파싱', () => {
    test('기본 의도 파싱 테스트', async () => {
      const userRequest = '따뜻한 느낌으로 짧고 강렬하게 써주세요';
      
      const result = await intentParser.parseIntent({
        userRequest,
        storeProfile: testStoreProfile
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.emotion).toBe('따뜻함');
      expect(result.data?.desiredLength).toBe('short');
      expect(result.data?.confidence).toBeGreaterThan(0);
    });

    test('복잡한 의도 파싱 테스트', async () => {
      const userRequest = '30대 커플을 타겟으로 럭셔리하고 세련된 느낌으로 긴 문구로 작성해주세요. 특별한 날을 강조하고 싶어요.';
      
      const result = await intentParser.parseIntent({
        userRequest,
        storeProfile: testStoreProfile
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.target).toBe('30대');
      expect(result.data?.tone).toBe('세련됨');
      expect(result.data?.desiredLength).toBe('long');
      expect(result.data?.specialRequirements).toContain('특별한 날');
    });

    test('가게 정보 반영 테스트', async () => {
      const userRequest = '가게 스타일에 맞게 작성해주세요';
      
      const result = await intentParser.parseIntent({
        userRequest,
        storeProfile: testStoreProfile
      });

      expect(result.success).toBe(true);
      expect(result.data?.tone).toBe('따뜻함'); // 가게의 톤앤매너 반영
    });
  });

  describe('2단계: RAG 검색', () => {
    test('라우터 쿼리 엔진 테스트', async () => {
      const query = '따뜻한 느낌의 문구 스타일';
      
      const results = await routerQueryEngine.query(query);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // 결과 구조 확인
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('content');
      expect(firstResult).toHaveProperty('source');
      expect(firstResult).toHaveProperty('score');
      expect(firstResult).toHaveProperty('type');
    });

    test('키워드 기반 검색 테스트', async () => {
      const query = '금지어 목록 조회';
      
      const results = await routerQueryEngine.query(query);
      
      expect(Array.isArray(results)).toBe(true);
      // 키워드 검색이 적절히 수행되었는지 확인
    });

    test('하이브리드 검색 테스트', async () => {
      const query = '30대 고객층을 위한 마케팅 문구';
      
      const results = await routerQueryEngine.query(query);
      
      expect(Array.isArray(results)).toBe(true);
      // 하이브리드 검색이 적절히 수행되었는지 확인
    });
  });

  describe('3단계: 통합 문구 생성', () => {
    test('사용자 요청 기반 캡션 생성 테스트', async () => {
      const input = {
        imageDescription: '아침 햇살이 비치는 펜션 객실',
        userRequest: '따뜻하고 아늑한 느낌으로 짧게 써주세요',
        storeProfile: testStoreProfile,
        storePolicy: testStorePolicy,
        emotion: '따뜻함',
        targetLength: 'short' as const
      };

      const result = await captionGenerator.generateCaption(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.caption).toBeDefined();
      expect(result.data?.hashtags).toBeDefined();
      expect(result.data?.parsedIntent).toBeDefined();
      expect(result.data?.retrievedEvidence).toBeDefined();
    });

    test('의도 파싱 없이 캡션 생성 테스트', async () => {
      const input = {
        imageDescription: '아침 햇살이 비치는 펜션 객실',
        storeProfile: testStoreProfile,
        storePolicy: testStorePolicy,
        emotion: '따뜻함',
        targetLength: 'medium' as const
      };

      const result = await captionGenerator.generateCaption(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.caption).toBeDefined();
      // userRequest가 없으면 parsedIntent와 retrievedEvidence는 undefined
      expect(result.data?.parsedIntent).toBeUndefined();
      expect(result.data?.retrievedEvidence).toBeUndefined();
    });

    test('복잡한 요청 기반 캡션 생성 테스트', async () => {
      const input = {
        imageDescription: '저녁 노을이 비치는 펜션 정원',
        userRequest: '40대 커플을 타겟으로 정중하고 세련된 느낌으로 긴 문구로 작성해주세요. 특별한 날을 강조하고 싶어요.',
        storeProfile: testStoreProfile,
        storePolicy: testStorePolicy,
        emotion: '세련됨',
        targetLength: 'long' as const
      };

      const result = await captionGenerator.generateCaption(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.parsedIntent).toBeDefined();
      expect(result.data?.parsedIntent?.target).toBe('40대');
      expect(result.data?.parsedIntent?.tone).toBe('정중함');
      expect(result.data?.parsedIntent?.desiredLength).toBe('long');
    });
  });

  describe('에러 처리', () => {
    test('빈 사용자 요청 처리', async () => {
      const result = await intentParser.parseIntent({
        userRequest: '',
        storeProfile: testStoreProfile
      });

      expect(result.success).toBe(false);
    });

    test('필수 필드 누락 처리', async () => {
      const result = await captionGenerator.generateCaption({
        imageDescription: '',
        storeProfile: testStoreProfile
      } as any);

      expect(result.success).toBe(false);
    });
  });
});
