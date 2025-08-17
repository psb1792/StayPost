import { AIChainResult } from '../chains/base-chain';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ErrorContext {
  operation: string;
  input: any;
  storeSlug?: string;
  attempt: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  };

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // 지수 백오프를 사용한 재시도 로직
  public async withRetry<T>(
    operation: () => Promise<T>,
    context: Omit<ErrorContext, 'attempt'>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: Error;

    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === retryConfig.maxRetries) {
          break;
        }

        // 재시도 가능한 에러인지 확인
        if (!this.isRetryableError(lastError)) {
          throw lastError;
        }

        // 지수 백오프로 대기
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );

        console.warn(`Retry attempt ${attempt}/${retryConfig.maxRetries} for ${context.operation}`, {
          error: lastError.message,
          delay,
          storeSlug: context.storeSlug
        });

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  // 재시도 가능한 에러인지 판단
  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'rate_limit_exceeded',
      'insufficient_quota',
      'server_error',
      'service_unavailable'
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError.toLowerCase())
    );
  }

  // 폴백 응답 생성
  public createFallbackResponse(operation: string, input: any): AIChainResult {
    const fallbackResponses: Record<string, AIChainResult> = {
      'image-suitability': {
        success: true,
        data: {
          suitability_score: 0.5,
          confidence: 0.3,
          recommendations: ['이미지를 다시 확인해주세요'],
          is_suitable: false
        },
        metadata: {
          model: 'fallback',
          tokens_used: 0,
          response_time: 0
        }
      },
      'caption-generation': {
        success: true,
        data: {
          caption: 'AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
          confidence: 0.3,
          style: 'neutral',
          length: 'medium'
        },
        metadata: {
          model: 'fallback',
          tokens_used: 0,
          response_time: 0
        }
      },
      'hashtag-generation': {
        success: true,
        data: {
          hashtags: ['#일시적오류', '#잠시후재시도'],
          confidence: 0.3,
          count: 2
        },
        metadata: {
          model: 'fallback',
          tokens_used: 0,
          response_time: 0
        }
      },
      'intent-parsing': {
        success: true,
        data: {
          intent: 'general',
          confidence: 0.3,
          parameters: {},
          suggestions: ['요청을 다시 입력해주세요']
        },
        metadata: {
          model: 'fallback',
          tokens_used: 0,
          response_time: 0
        }
      }
    };

    return fallbackResponses[operation] || {
      success: false,
      error: '폴백 응답을 생성할 수 없습니다',
      metadata: {
        model: 'fallback',
        tokens_used: 0,
        response_time: 0
      }
    };
  }

  // 사용자 친화적 에러 메시지 생성
  public getUserFriendlyMessage(error: Error, operation: string): string {
    const errorMessages: Record<string, string> = {
      'rate_limit_exceeded': 'AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.',
      'insufficient_quota': 'AI 서비스 할당량이 부족합니다. 관리자에게 문의해주세요.',
      'invalid_api_key': 'AI 서비스 인증에 문제가 있습니다. 설정을 확인해주세요.',
      'server_error': 'AI 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
      'timeout': '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.',
      'network_error': '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.'
    };

    const errorKey = this.getErrorKey(error);
    return errorMessages[errorKey] || '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';
  }

  private getErrorKey(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('rate_limit')) return 'rate_limit_exceeded';
    if (message.includes('quota')) return 'insufficient_quota';
    if (message.includes('api_key') || message.includes('authentication')) return 'invalid_api_key';
    if (message.includes('server_error') || message.includes('500')) return 'server_error';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network') || message.includes('connection')) return 'network_error';
    
    return 'unknown';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 에러 로깅
  public logError(error: Error, context: ErrorContext): void {
    console.error(`AI Operation Error: ${context.operation}`, {
      error: error.message,
      stack: error.stack,
      input: context.input,
      storeSlug: context.storeSlug,
      attempt: context.attempt,
      timestamp: new Date().toISOString()
    });
  }
}
