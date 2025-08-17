import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { HashtagGenerationChain } from '../chains/hashtag-generation';
import { routerQueryEngine } from '../retrieval/router-query-engine';

// Mock router query engine
jest.mock('../retrieval/router-query-engine', () => ({
  routerQueryEngine: {
    query: jest.fn()
  }
}));

describe('HashtagGenerationChain', () => {
  let chain: HashtagGenerationChain;
  const mockRouterQuery = routerQueryEngine.query as jest.MockedFunction<typeof routerQueryEngine.query>;

  beforeEach(() => {
    chain = new HashtagGenerationChain();
    jest.clearAllMocks();
  });

  describe('input validation', () => {
    it('should validate required fields', () => {
      const validInput = {
        postContent: '테스트 게시물 내용',
        storeInfo: {
          name: '테스트 가게',
          category: '카페'
        }
      };

      expect(chain['validateInput'](validInput)).toBe(true);
    });

    it('should reject invalid input', () => {
      const invalidInputs = [
        { postContent: '', storeInfo: { name: '테스트', category: '카페' } },
        { postContent: '테스트', storeInfo: { name: '', category: '카페' } },
        { postContent: '테스트', storeInfo: { name: '테스트', category: '' } },
        { postContent: '테스트', storeInfo: null },
        { postContent: null, storeInfo: { name: '테스트', category: '카페' } }
      ];

      invalidInputs.forEach(input => {
        expect(chain['validateInput'](input as any)).toBe(false);
      });
    });
  });

  describe('guidelines search', () => {
    it('should search for guidelines using router', async () => {
      const mockGuidelinesResults = [
        { content: '해시태그 생성 가이드라인 1', score: 0.8 },
        { content: '해시태그 생성 가이드라인 2', score: 0.7 }
      ];

      const mockForbiddenResults = [
        { content: '금지어1, 금지어2', score: 0.9 }
      ];

      const mockBrandResults = [
        { content: '브랜드 가이드라인 1', score: 0.8 }
      ];

      mockRouterQuery
        .mockResolvedValueOnce(mockGuidelinesResults)
        .mockResolvedValueOnce(mockForbiddenResults)
        .mockResolvedValueOnce(mockBrandResults);

      const input = {
        postContent: '테스트',
        storeInfo: {
          name: '테스트 가게',
          category: '카페'
        }
      };

      const result = await chain['searchGuidelines'](input);

      expect(mockRouterQuery).toHaveBeenCalledTimes(3);
      expect(mockRouterQuery).toHaveBeenCalledWith('해시태그 생성 가이드라인 카페 업종');
      expect(mockRouterQuery).toHaveBeenCalledWith('금지어 목록 카페 해시태그');
      expect(mockRouterQuery).toHaveBeenCalledWith('브랜드 가이드라인 테스트 가게 해시태그');

      expect(result.guidelines).toContain('해시태그 생성 가이드라인 1');
      expect(result.forbiddenWords).toContain('금지어1, 금지어2');
      expect(result.brandGuidelines).toContain('브랜드 가이드라인 1');
    });

    it('should handle search errors gracefully', async () => {
      mockRouterQuery.mockRejectedValue(new Error('Search failed'));

      const input = {
        postContent: '테스트',
        storeInfo: {
          name: '테스트 가게',
          category: '카페'
        }
      };

      const result = await chain['searchGuidelines'](input);

      expect(result.guidelines).toBe('');
      expect(result.forbiddenWords).toBe('');
      expect(result.brandGuidelines).toBe('');
    });
  });

  describe('post processing', () => {
    it('should parse valid JSON result', () => {
      const mockResult = JSON.stringify({
        hashtags: ['#테스트1', '#테스트2'],
        categories: {
          brand: ['#브랜드1'],
          location: ['#위치1'],
          emotion: ['#감정1'],
          category: ['#업종1'],
          trending: ['#트렌드1']
        },
        reasoning: '테스트 근거',
        compliance: {
          forbiddenWords: [],
          brandGuidelines: ['가이드라인1']
        }
      });

      const processed = chain['postProcess'](mockResult);

      expect(processed.hashtags).toEqual(['#테스트1', '#테스트2']);
      expect(processed.categories.brand).toEqual(['#브랜드1']);
      expect(processed.reasoning).toBe('테스트 근거');
      expect(processed.compliance.brandGuidelines).toEqual(['가이드라인1']);
    });

    it('should handle invalid JSON gracefully', () => {
      const invalidResult = 'invalid json';

      const processed = chain['postProcess'](invalidResult);

      expect(processed.hashtags).toEqual([]);
      expect(processed.categories.brand).toEqual([]);
      expect(processed.reasoning).toBe('태그 생성 중 오류가 발생했습니다');
    });

    it('should handle partial JSON data', () => {
      const partialResult = JSON.stringify({
        hashtags: ['#테스트1'],
        // categories missing
        reasoning: '테스트'
        // compliance missing
      });

      const processed = chain['postProcess'](partialResult);

      expect(processed.hashtags).toEqual(['#테스트1']);
      expect(processed.categories.brand).toEqual([]);
      expect(processed.reasoning).toBe('테스트');
      expect(processed.compliance.forbiddenWords).toEqual([]);
    });
  });

  describe('full chain execution', () => {
    it('should generate hashtags successfully', async () => {
      // Mock router responses
      mockRouterQuery
        .mockResolvedValueOnce([{ content: '가이드라인 테스트', score: 0.8 }])
        .mockResolvedValueOnce([{ content: '금지어 없음', score: 0.9 }])
        .mockResolvedValueOnce([{ content: '브랜드 가이드라인 테스트', score: 0.8 }]);

      // Mock LLM response
      const mockLLMResponse = JSON.stringify({
        hashtags: ['#카페', '#커피', '#테스트'],
        categories: {
          brand: ['#카페'],
          location: [],
          emotion: ['#커피'],
          category: ['#카페'],
          trending: ['#테스트']
        },
        reasoning: '카페 관련 해시태그 생성',
        compliance: {
          forbiddenWords: [],
          brandGuidelines: ['브랜드 가이드라인 준수']
        }
      });

      // Mock the chain execution
      jest.spyOn(chain['chain'], 'invoke').mockResolvedValue(mockLLMResponse);

      const input = {
        postContent: '맛있는 커피를 즐겨보세요!',
        storeInfo: {
          name: '테스트 카페',
          category: '카페',
          location: '서울',
          description: '스페셜티 커피 전문점'
        },
        targetAudience: '커피 애호가',
        emotion: '따뜻함',
        maxHashtags: 5
      };

      const result = await chain.invoke(input);

      expect(result.success).toBe(true);
      expect(result.data?.hashtags).toEqual(['#카페', '#커피', '#테스트']);
      expect(result.data?.reasoning).toBe('카페 관련 해시태그 생성');
      expect(result.metadata?.model).toBeDefined();
      expect(result.metadata?.latency).toBeGreaterThan(0);
    });

    it('should handle chain execution errors', async () => {
      // Mock router responses
      mockRouterQuery
        .mockResolvedValueOnce([{ content: '가이드라인', score: 0.8 }])
        .mockResolvedValueOnce([{ content: '금지어', score: 0.9 }])
        .mockResolvedValueOnce([{ content: '브랜드', score: 0.8 }]);

      // Mock chain error
      jest.spyOn(chain['chain'], 'invoke').mockRejectedValue(new Error('LLM error'));

      const input = {
        postContent: '테스트',
        storeInfo: {
          name: '테스트',
          category: '카페'
        }
      };

      const result = await chain.invoke(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('LLM error');
    });
  });
});
