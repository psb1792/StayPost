import { 
  createChain, 
  ChainType
} from '../chains';
import { AIChainResult } from '../chains/base-chain';
import { ContentAnalysisChain } from '../chains/content-analysis';
import { CaptionGenerationChain } from '../chains/caption-generation';
import { StyleSuggestionChain } from '../chains/style-suggestion';
import { ComplianceCheckChain } from '../chains/compliance-check';
import { ImageSuitabilityChain } from '../chains/image-suitability';
import { IntentParsingChain } from '../chains/intent-parsing';
import { HashtagGenerationChain } from '../chains/hashtag-generation';
import { aiDecisionLogger } from './ai-decision-logger';
import { CacheService } from './cache-service';
import { ErrorHandler } from './error-handler';

// AI 체인 통합 서비스
export class AIChainService {
  private static instance: AIChainService;
  private chains: Map<ChainType, any> = new Map();
  private cacheService: CacheService;
  private errorHandler: ErrorHandler;
  private apiKey: string;

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.cacheService = CacheService.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
  }

  public static getInstance(apiKey?: string): AIChainService {
    if (!AIChainService.instance) {
      if (!apiKey) {
        throw new Error('API key is required for AIChainService');
      }
      AIChainService.instance = new AIChainService(apiKey);
    }
    return AIChainService.instance;
  }

  // 체인 초기화
  private async getChain(type: ChainType) {
    try {
      if (!this.chains.has(type)) {
        console.log(`Initializing chain: ${type}`);
        const chain = await createChain(type, this.apiKey);
        
        // 체인이 제대로 생성되었는지 확인
        if (!chain) {
          throw new Error(`Failed to create chain: ${type}`);
        }
        
        this.chains.set(type, chain);
        console.log(`Chain initialized successfully: ${type}`);
      }
      
      const chain = this.chains.get(type);
      if (!chain) {
        throw new Error(`Chain not found after initialization: ${type}`);
      }
      
      return chain;
    } catch (error) {
      console.error(`Error getting chain ${type}:`, error);
      throw error;
    }
  }

  // 콘텐츠 분석 (최적화된 버전)
  public async analyzeContent(input: {
    content: string;
    storeProfile: any;
    imageDescription?: string;
  }): Promise<AIChainResult> {
    const cacheKey = {
      type: 'content-analysis',
      input: JSON.stringify(input),
      storeSlug: input.storeProfile?.store_slug
    };

    // 캐시 확인
    const cached = this.cacheService.get<AIChainResult>(cacheKey);
    if (cached) {
      console.log('Cache hit for content-analysis');
      return cached;
    }

    const monitor = aiDecisionLogger.createPerformanceMonitor('2.1', 'content-analysis');
    
    try {
      const result = await this.errorHandler.withRetry(
        async () => {
          const chain = await this.getChain('content-analysis');
          return await chain.analyzeContent({
            text: input.content,
            context: input.imageDescription
          });
        },
        {
          operation: 'content-analysis',
          input,
          storeSlug: input.storeProfile?.store_slug
        }
      );
      
      // 캐시에 저장
      this.cacheService.set(cacheKey, result, 10 * 60 * 1000); // 10분 캐시
      
      // 비용 계산 및 로깅
      try {
        const cost = aiDecisionLogger.calculateCost(
          result.metadata?.tokens || 0,
          result.metadata?.tokens || 0,
          'gpt-4o'
        );
        
        await monitor.logSuccess(
          result,
          input,
          input.storeProfile?.store_slug,
          undefined,
          'gpt-4o',
          cost
        );
        
        console.log(`Content analysis completed - Cost: $${cost.toFixed(4)}`);
      } catch (loggingError) {
        console.warn('Failed to log content analysis success, but continuing:', loggingError);
      }
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logError(
          errorObj,
          input,
          input.storeProfile?.store_slug
        );
      } catch (loggingError) {
        console.warn('Failed to log content analysis error, but continuing:', loggingError);
      }

      // 폴백 응답 반환
      const fallback = this.errorHandler.createFallbackResponse('content-analysis', input);
      console.warn('Using fallback response for content-analysis:', errorObj.message);
      
      return fallback;
    }
  }

  // 캡션 생성 (Phase 2.3 3단계 구현)
  public async generateCaption(input: {
    imageDescription: string;
    userRequest?: string; // 사용자 요청 추가
    storeProfile: any;
    storePolicy?: any;
    emotion?: string;
    targetLength?: 'short' | 'medium' | 'long';
  }): Promise<AIChainResult> {
    const monitor = aiDecisionLogger.createPerformanceMonitor('2.3', 'caption-generation');
    
    try {
      const chain = await this.getChain('caption-generation');
      const result = await chain.generateCaption(input);
      
      // 비용 계산 및 로깅
      try {
        const cost = aiDecisionLogger.calculateCost(
          result.metadata?.tokens || 0,
          result.metadata?.tokens || 0,
          'gpt-4o'
        );
        
        await monitor.logSuccess(
          result,
          input,
          input.storeProfile?.store_slug,
          undefined,
          'gpt-4o',
          cost
        );
        
        console.log(`Caption generation completed - Cost: $${cost.toFixed(4)}`);
      } catch (loggingError) {
        console.warn('Failed to log caption generation success, but continuing:', loggingError);
      }
      
      return result;
    } catch (error) {
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logError(
          error instanceof Error ? error : new Error('Unknown error'),
          input,
          input.storeProfile?.store_slug
        );
      } catch (loggingError) {
        console.warn('Failed to log caption generation error, but continuing:', loggingError);
      }
      throw error;
    }
  }

  // 사용자 의도 파싱 (새로 추가)
  public async parseIntent(input: {
    userRequest: string;
    storeProfile?: any;
  }): Promise<AIChainResult> {
    const monitor = aiDecisionLogger.createPerformanceMonitor('2.2', 'intent-parsing');
    
    try {
      const chain = await this.getChain('intent-parsing') as IntentParsingChain;
      const result = await chain.parseIntent({
        text: input.userRequest,
        context: input.storeProfile ? JSON.stringify(input.storeProfile) : undefined
      });
      
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logSuccess(
          result,
          input,
          input.storeProfile?.store_slug,
          undefined,
          'gpt-4o'
        );
      } catch (loggingError) {
        console.warn('Failed to log intent parsing success, but continuing:', loggingError);
      }
      
      return result;
    } catch (error) {
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logError(
          error instanceof Error ? error : new Error('Unknown error'),
          input,
          input.storeProfile?.store_slug
        );
      } catch (loggingError) {
        console.warn('Failed to log intent parsing error, but continuing:', loggingError);
      }
      throw error;
    }
  }

  // 스타일 제안
  public async suggestStyle(input: {
    emotion: string;
    storeProfile: any;
    currentStyle?: string;
    targetAudience?: string;
  }): Promise<AIChainResult> {
    const monitor = aiDecisionLogger.createPerformanceMonitor('2.2', 'style-suggestion');
    
    try {
      const chain = await this.getChain('style-suggestion') as StyleSuggestionChain;
      const result = await chain.suggestStyle({
        storeSlug: input.storeProfile?.store_slug || 'unknown',
        currentStyle: input.currentStyle,
        targetAudience: input.targetAudience
      });
      
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logSuccess(
          result,
          input,
          input.storeProfile?.store_slug,
          undefined,
          'gpt-4o'
        );
      } catch (loggingError) {
        console.warn('Failed to log style suggestion success, but continuing:', loggingError);
      }
      
      return result;
    } catch (error) {
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logError(
          error instanceof Error ? error : new Error('Unknown error'),
          input,
          input.storeProfile?.store_slug
        );
      } catch (loggingError) {
        console.warn('Failed to log style suggestion error, but continuing:', loggingError);
      }
      throw error;
    }
  }

  // 규정 준수 검사
  public async checkCompliance(input: {
    content: string;
    storePolicy: any;
    storeProfile?: any;
  }): Promise<AIChainResult> {
    const monitor = aiDecisionLogger.createPerformanceMonitor('2.1', 'compliance-check');
    
    try {
      const chain = await this.getChain('compliance-check') as ComplianceCheckChain;
      const result = await chain.checkCompliance({
        text: input.content,
        storePolicy: input.storePolicy
      });
      
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logSuccess(
          result,
          input,
          input.storeProfile?.store_slug,
          undefined,
          'gpt-4o'
        );
      } catch (loggingError) {
        console.warn('Failed to log compliance check success, but continuing:', loggingError);
      }
      
      return result;
    } catch (error) {
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logError(
          error instanceof Error ? error : new Error('Unknown error'),
          input,
          input.storeProfile?.store_slug
        );
      } catch (loggingError) {
        console.warn('Failed to log compliance check error, but continuing:', loggingError);
      }
      throw error;
    }
  }

  // 이미지 적합성 판단
  public async checkImageSuitability(input: {
    imageUrl: string;
    storeMeta: {
      name: string;
      category: string;
      description?: string;
      targetAudience?: string;
      brandTone?: string;
      location?: string;
    };
    context?: {
      campaignType?: string;
      season?: string;
      specialEvent?: string;
    };
    useVision?: boolean;
    apiKey?: string; // API 키 추가
  }): Promise<AIChainResult> {
    const monitor = aiDecisionLogger.createPerformanceMonitor('2.1', 'image-suitability');
    
    try {
      // API 키가 없으면 에러
      if (!input.apiKey) {
        throw new Error('API key is required for image suitability check');
      }
      
      // ImageSuitabilityChain을 직접 생성
      const { ImageSuitabilityChain } = await import('../chains/image-suitability');
      const chain = new ImageSuitabilityChain(input.apiKey);
      
      let result: AIChainResult;
      
      if (input.useVision !== false) {
        result = await chain.invokeWithVision({
          imageUrl: input.imageUrl,
          storeMeta: input.storeMeta,
          context: input.context
        });
      } else {
        result = await chain.quickCheck({
          imageUrl: input.imageUrl,
          storeMeta: input.storeMeta,
          context: input.context
        });
      }
      
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logSuccess(
          result,
          input,
          undefined,
          undefined,
          input.useVision !== false ? 'gpt-4o' : 'gpt-3.5-turbo'
        );
      } catch (loggingError) {
        console.warn('Failed to log success, but continuing:', loggingError);
      }
      
      return result;
    } catch (error) {
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logError(
          error instanceof Error ? error : new Error('Unknown error'),
          input
        );
      } catch (loggingError) {
        console.warn('Failed to log error, but continuing:', loggingError);
      }
      throw error;
    }
  }

  // 빠른 규정 준수 검사
  public quickComplianceCheck(content: string, forbiddenWords: string[] = []): {
    compliant: boolean;
    foundWords: string[];
  } {
    const chain = this.chains.get('compliance-check') as ComplianceCheckChain;
    if (!chain) {
      // 체인이 없으면 간단한 검사만 수행
      const foundWords = forbiddenWords.filter(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
      return {
        compliant: foundWords.length === 0,
        foundWords
      };
    }
    return chain.quickCheck(content, forbiddenWords);
  }

  // 해시태그 생성 (Phase 2.5 5단계 구현)
  public async generateHashtags(input: {
    postContent: string;
    storeInfo: {
      name: string;
      category: string;
      location?: string;
      description?: string;
      brandGuidelines?: string[];
    };
    targetAudience?: string;
    emotion?: string;
    maxHashtags?: number;
  }): Promise<AIChainResult> {
    const monitor = aiDecisionLogger.createPerformanceMonitor('2.5', 'hashtag-generation');
    
    try {
      const chain = await this.getChain('hashtag-generation') as HashtagGenerationChain;
      const result = await chain.invoke(input);
      
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logSuccess(
          result,
          input,
          input.storeInfo?.name,
          undefined,
          'gpt-4o'
        );
      } catch (loggingError) {
        console.warn('Failed to log hashtag generation success, but continuing:', loggingError);
      }
      
      return result;
    } catch (error) {
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logError(
          error instanceof Error ? error : new Error('Unknown error'),
          input,
          input.storeInfo?.name
        );
      } catch (loggingError) {
        console.warn('Failed to log hashtag generation error, but continuing:', loggingError);
      }
      throw error;
    }
  }

  // 이미지 스타일 분석 (Vision 모델 사용)
  public async analyzeImageStyle(input: {
    imageUrl: string;
    prompt: string;
    storeProfile: any;
    apiKey?: string; // API 키 추가
    customPrompt?: string; // 커스텀 프롬프트 추가
  }): Promise<AIChainResult> {
    const cacheKey = {
      type: 'image-style-analysis',
      operation: 'image-style-analysis',
      input: JSON.stringify({ ...input, imageUrl: 'image-data' }), // 이미지 URL은 캐시 키에서 제외
      storeSlug: input.storeProfile?.store_slug
    };

    // 캐시 확인
    const cached = this.cacheService.get<AIChainResult>(cacheKey);
    if (cached) {
      console.log('Cache hit for image-style-analysis');
      return cached;
    }

    const monitor = aiDecisionLogger.createPerformanceMonitor('2.1', 'image-style-analysis');
    
    try {
      const result = await this.errorHandler.withRetry(
        async () => {
          // API 키가 없으면 에러
          if (!input.apiKey) {
            throw new Error('API key is required for image style analysis');
          }
          
          console.log('Creating ImageSuitabilityChain with API key...');
          const { ImageSuitabilityChain } = await import('../chains/image-suitability');
          const chain = new ImageSuitabilityChain(input.apiKey);
          
          console.log('Chain created, calling invokeWithVision...');
          console.log('Input imageUrl length:', input.imageUrl.length);
          console.log('Store meta:', {
            name: input.storeProfile.name || 'Unknown Store',
            category: input.storeProfile.category || 'General',
            description: input.storeProfile.description,
            targetAudience: input.storeProfile.target_audience,
            brandTone: input.storeProfile.brand_tone
          });
          
          const visionResult = await chain.invokeWithVision({
            imageUrl: input.imageUrl,
            storeMeta: {
              name: input.storeProfile.name || 'Unknown Store',
              category: input.storeProfile.category || 'General',
              description: input.storeProfile.description,
              targetAudience: input.storeProfile.target_audience,
              brandTone: input.storeProfile.brand_tone
            },
            customPrompt: input.customPrompt // 커스텀 프롬프트 전달
          });
          
          console.log('Vision result:', visionResult);
          return visionResult;
        },
        {
          operation: 'image-style-analysis',
          input: { ...input, imageUrl: 'image-data' },
          storeSlug: input.storeProfile?.store_slug
        }
      );
      
      // 캐시에 저장
      this.cacheService.set(cacheKey, result, 10 * 60 * 1000); // 10분 캐시
      
      // 비용 계산 및 로깅
      try {
        const cost = aiDecisionLogger.calculateCost(
          result.metadata?.tokens || 0,
          result.metadata?.tokens || 0,
          'gpt-4o'
        );
        
        await monitor.logSuccess(
          result,
          input,
          input.storeProfile?.store_slug,
          undefined,
          'gpt-4o',
          cost
        );
        
        console.log(`Image style analysis completed - Cost: $${cost.toFixed(4)}`);
      } catch (loggingError) {
        console.warn('Failed to log image style analysis success, but continuing:', loggingError);
      }
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      
      console.error('Error in analyzeImageStyle:', errorObj);
      console.error('Error stack:', errorObj.stack);
      
      // 로깅 시도하되 실패해도 계속 진행
      try {
        await monitor.logError(
          errorObj,
          input,
          input.storeProfile?.store_slug
        );
      } catch (loggingError) {
        console.warn('Failed to log image style analysis error, but continuing:', loggingError);
      }

      // 폴백 응답 반환
      const fallback = this.errorHandler.createFallbackResponse('image-style-analysis', input);
      console.warn('Using fallback response for image-style-analysis:', errorObj.message);
      
      return fallback;
    }
  }

  // 배치 처리: 여러 작업을 한번에 실행
  public async batchProcess(tasks: Array<{
    type: ChainType;
    input: any;
    id?: string;
  }>): Promise<Array<{
    id?: string;
    type: ChainType;
    result: AIChainResult;
  }>> {
    const results = [];
    
    for (const task of tasks) {
      try {
        const chain = await this.getChain(task.type);
        let result: AIChainResult;
        
        switch (task.type) {
          case 'content-analysis':
            result = await (chain as ContentAnalysisChain).analyzeContent({
              text: task.input.content || task.input.text,
              context: task.input.context
            });
            break;
          case 'caption-generation':
            result = await (chain as CaptionGenerationChain).generateCaption(task.input);
            break;
          case 'style-suggestion':
            result = await (chain as StyleSuggestionChain).suggestStyle({
              storeSlug: task.input.storeSlug || task.input.storeProfile?.store_slug || 'unknown',
              currentStyle: task.input.currentStyle,
              targetAudience: task.input.targetAudience
            });
            break;
          case 'compliance-check':
            result = await (chain as ComplianceCheckChain).checkCompliance({
              text: task.input.content || task.input.text,
              storePolicy: task.input.storePolicy
            });
            break;
          case 'image-suitability':
            result = await (chain as ImageSuitabilityChain).invokeWithVision(task.input);
            break;
          case 'intent-parsing':
            result = await (chain as IntentParsingChain).parseIntent({
              text: task.input.userRequest || task.input.text,
              context: task.input.context
            });
            break;
          case 'hashtag-generation':
            result = await (chain as HashtagGenerationChain).invoke(task.input);
            break;
          default:
            result = { success: false, error: `Unknown chain type: ${task.type}` };
        }
        
        results.push({
          id: task.id,
          type: task.type,
          result
        });
      } catch (error) {
        results.push({
          id: task.id,
          type: task.type,
          result: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }
    
    return results;
  }

  // 체인 상태 확인
  public getChainStatus(): Record<ChainType, boolean> {
    const status: Record<ChainType, boolean> = {
      'content-analysis': this.chains.has('content-analysis'),
      'caption-generation': this.chains.has('caption-generation'),
      'style-suggestion': this.chains.has('style-suggestion'),
      'compliance-check': this.chains.has('compliance-check'),
      'image-suitability': this.chains.has('image-suitability'),
      'intent-parsing': this.chains.has('intent-parsing'),
      'hashtag-generation': this.chains.has('hashtag-generation')
    };
    return status;
  }

  // 체인 초기화 상태
  public async initializeAllChains(): Promise<void> {
    const chainTypes: ChainType[] = [
      'content-analysis',
      'caption-generation', 
      'style-suggestion',
      'compliance-check',
      'image-suitability',
      'intent-parsing',
      'hashtag-generation'
    ];

    for (const type of chainTypes) {
      await this.getChain(type);
    }
  }
}

// 싱글톤 인스턴스는 API 키가 필요하므로 제거
// 대신 각 사용처에서 API 키와 함께 getInstance()를 호출하세요
