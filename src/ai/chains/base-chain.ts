import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';
import { createLLM } from '../clients';

// AI 호출 결과 타입
export interface AIChainResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    model: string;
    latency: number;
    tokens: number;
    retryCount: number;
  };
}

// AI 체인 기본 클래스
export abstract class BaseAIChain<TInput = any, TOutput = any> {
  protected llm: ChatOpenAI;
  protected prompt!: ChatPromptTemplate;
  protected chain!: Runnable;
  protected retryCount: number = 3;

  constructor(apiKey?: string) {
    console.log('BaseAIChain constructor called with apiKey:', !!apiKey);
    if (!apiKey) {
      console.log('No API key provided to BaseAIChain');
      throw new Error('API key is required for BaseAIChain');
    }
    console.log('Creating LLM with API key...');
    this.llm = createLLM(apiKey);
    console.log('LLM created successfully');
    // 하위 클래스에서 initializeChain을 호출하도록 변경
  }

  // 체인 초기화 - 하위 클래스에서 구현
  protected abstract initializeChain(): void;

  // 출력 스키마 정의 - 하위 클래스에서 구현 (zod 스키마 사용)
  protected abstract getOutputSchema(): any;

  // 프롬프트 템플릿 정의 - 하위 클래스에서 구현
  protected abstract getPromptTemplate(): ChatPromptTemplate;

  // 입력 검증 - 하위 클래스에서 구현
  protected abstract validateInput(input: TInput): boolean;

  // 결과 후처리 - 하위 클래스에서 구현
  protected abstract postProcess(result: any): TOutput;

  // 체인 실행
  public async invoke(input: TInput): Promise<AIChainResult<TOutput>> {
    const startTime = Date.now();
    let retryCount = 0;

    try {
      // 입력 검증
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input data',
          metadata: {
            model: this.llm.model,
            latency: Date.now() - startTime,
            tokens: 0,
            retryCount: 0
          }
        };
      }

      // 체인 실행 (재시도 로직 포함)
      let result;
      while (retryCount < this.retryCount) {
        try {
          result = await this.chain.invoke(input);
          break;
        } catch (error) {
          retryCount++;
          if (retryCount >= this.retryCount) {
            throw error;
          }
          // 재시도 전 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      // 결과 후처리
      const processedResult = this.postProcess(result);

      return {
        success: true,
        data: processedResult,
        metadata: {
          model: this.llm.model,
          latency: Date.now() - startTime,
          tokens: this.estimateTokens(input, result),
          retryCount
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          model: this.llm.model,
          latency: Date.now() - startTime,
          tokens: 0,
          retryCount
        }
      };
    }
  }

  // 토큰 수 추정 (간단한 추정)
  protected estimateTokens(input: TInput, output: any): number {
    const inputStr = JSON.stringify(input);
    const outputStr = JSON.stringify(output);
    return Math.ceil((inputStr.length + outputStr.length) / 4);
  }

  // 로깅
  protected logExecution(task: string, input: TInput, result: AIChainResult<TOutput>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI Chain] ${task}:`, {
        input: input,
        success: result.success,
        latency: result.metadata?.latency,
        tokens: result.metadata?.tokens,
        retryCount: result.metadata?.retryCount
      });
    }
  }
}
