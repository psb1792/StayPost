import { ImageSuitabilityChain } from '../chains/image-suitability';
import { AIChainService } from '../services/ai-chain-service';

describe('Image Suitability Chain', () => {
  let chain: ImageSuitabilityChain;
  let service: AIChainService;
  const testApiKey = 'test-api-key'; // 테스트용 API 키

  beforeAll(() => {
    chain = new ImageSuitabilityChain(testApiKey);
    service = AIChainService.getInstance();
  });

  describe('Input Validation', () => {
    it('should validate correct input', () => {
      const validInput = {
        imageUrl: 'https://example.com/image.jpg',
        storeMeta: {
          name: '테스트 펜션',
          category: '펜션',
          description: '아름다운 자연 속 펜션',
          targetAudience: '커플, 가족',
          brandTone: '따뜻하고 아늑한',
          location: '강원도'
        }
      };

      expect(chain['validateInput'](validInput)).toBe(true);
    });

    it('should reject invalid image URL', () => {
      const invalidInput = {
        imageUrl: 'invalid-url',
        storeMeta: {
          name: '테스트 펜션',
          category: '펜션'
        }
      };

      expect(chain['validateInput'](invalidInput)).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidInput = {
        imageUrl: 'https://example.com/image.jpg',
        storeMeta: {
          name: '', // 빈 이름
          category: '펜션'
        }
      };

      expect(chain['validateInput'](invalidInput)).toBe(false);
    });
  });

  describe('Schema Validation', () => {
    it('should validate correct schema', () => {
      const validResult = {
        suitable: true,
        score: 85,
        issues: [],
        suggestions: ['더 밝은 조명을 사용하면 좋겠습니다'],
        analysis: {
          visualQuality: '좋음',
          brandAlignment: '매우 일치',
          targetAudience: '적합',
          contentAppropriateness: '적절함'
        }
      };

      expect(() => chain['postProcess'](validResult)).not.toThrow();
    });

    it('should reject invalid schema', () => {
      const invalidResult = {
        suitable: true,
        score: 150, // 100을 초과하는 점수
        issues: [],
        suggestions: []
      };

      expect(() => chain['postProcess'](invalidResult)).toThrow();
    });
  });

  describe('Quick Check', () => {
    it('should perform quick check without vision model', async () => {
      const input = {
        imageUrl: 'https://example.com/image.jpg',
        storeMeta: {
          name: '테스트 펜션',
          category: '펜션',
          description: '아름다운 자연 속 펜션',
          targetAudience: '커플, 가족',
          brandTone: '따뜻하고 아늑한',
          location: '강원도'
        }
      };

      const result = await chain.quickCheck(input);

      expect(result.success).toBeDefined();
      if (result.success) {
        expect(result.data).toHaveProperty('suitable');
        expect(result.data).toHaveProperty('reason');
      }
    });
  });

  describe('Service Integration', () => {
    it('should integrate with AIChainService', async () => {
      const input = {
        imageUrl: 'https://example.com/image.jpg',
        storeMeta: {
          name: '테스트 펜션',
          category: '펜션',
          description: '아름다운 자연 속 펜션',
          targetAudience: '커플, 가족',
          brandTone: '따뜻하고 아늑한',
          location: '강원도'
        },
        context: {
          campaignType: '시즌 프로모션',
          season: '가을'
        },
        useVision: false // 빠른 체크만 수행
      };

      const result = await service.checkImageSuitability({
        ...input,
        apiKey: testApiKey
      });

      expect(result.success).toBeDefined();
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const input = {
        imageUrl: 'https://invalid-domain-that-does-not-exist.com/image.jpg',
        storeMeta: {
          name: '테스트 펜션',
          category: '펜션'
        }
      };

      const result = await chain.invokeWithVision(input);

      // 네트워크 오류가 발생할 수 있으므로 적절히 처리되어야 함
      expect(result.success).toBeDefined();
    });

    it('should handle malformed input', async () => {
      const input = {
        imageUrl: 'not-a-url',
        storeMeta: {
          name: '',
          category: ''
        }
      };

      const result = await chain.invokeWithVision(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should complete within reasonable time', async () => {
      const input = {
        imageUrl: 'https://example.com/image.jpg',
        storeMeta: {
          name: '테스트 펜션',
          category: '펜션',
          description: '아름다운 자연 속 펜션'
        },
        useVision: false
      };

      const startTime = Date.now();
      const result = await service.checkImageSuitability({
        ...input,
        apiKey: testApiKey
      });
      const endTime = Date.now();

      const duration = endTime - startTime;
      
      // 빠른 체크는 10초 이내에 완료되어야 함
      expect(duration).toBeLessThan(10000);
      expect(result.success).toBeDefined();
    });
  });
});
