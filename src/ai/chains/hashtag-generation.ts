import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { BaseAIChain, AIChainResult } from './base-chain';
import { routerQueryEngine } from '../retrieval/router-query-engine';
import { llm } from '../clients';

// 해시태그 생성 입력 타입
export interface HashtagGenerationInput {
  postContent: string;           // 게시물 내용
  storeInfo: {                   // 가게 정보
    name: string;
    category: string;
    location?: string;
    description?: string;
    brandGuidelines?: string[];  // 브랜드 가이드라인
  };
  targetAudience?: string;       // 타겟 오디언스
  emotion?: string;              // 감정 톤
  maxHashtags?: number;          // 최대 해시태그 수 (기본값: 10)
}

// 해시태그 생성 결과 타입
export interface HashtagGenerationOutput {
  hashtags: string[];            // 생성된 해시태그 목록
  categories: {                  // 카테고리별 분류
    brand: string[];             // 브랜드 관련
    location: string[];          // 위치 관련
    emotion: string[];           // 감정/톤 관련
    category: string[];          // 업종 관련
    trending: string[];          // 트렌드 관련
  };
  reasoning: string;             // 생성 근거
  compliance: {                  // 규정 준수 정보
    forbiddenWords: string[];    // 사용된 금지어
    brandGuidelines: string[];   // 준수한 브랜드 가이드라인
  };
}

// 해시태그 생성 체인
export class HashtagGenerationChain extends BaseAIChain<HashtagGenerationInput, HashtagGenerationOutput> {
  protected initializeChain(): void {
    this.prompt = this.getPromptTemplate();
    this.chain = RunnableSequence.from([
      this.prompt,
      this.llm,
      new StringOutputParser()
    ]);
  }

  protected getOutputSchema(): any {
    // StringOutputParser를 사용하므로 스키마 검증은 별도로 처리
    return null;
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromTemplate(`
당신은 인스타그램 마케팅 전문가입니다. 주어진 게시물과 가게 정보, 그리고 검색된 가이드라인을 바탕으로 최적의 해시태그를 생성해주세요.

## 게시물 내용
{postContent}

## 가게 정보
- 이름: {storeName}
- 카테고리: {storeCategory}
- 위치: {storeLocation}
- 설명: {storeDescription}

## 타겟 오디언스
{targetAudience}

## 감정 톤
{emotion}

## 검색된 가이드라인
{guidelines}

## 금지어 목록
{forbiddenWords}

## 브랜드 가이드라인
{brandGuidelines}

## 요구사항
1. 최대 {maxHashtags}개의 해시태그를 생성하세요
2. 금지어를 절대 사용하지 마세요
3. 브랜드 가이드라인을 준수하세요
4. 카테고리별로 분류하여 제공하세요
5. 한국어와 영어 태그를 적절히 조합하세요
6. 인스타그램 트렌드에 맞는 태그를 포함하세요

## 출력 형식
다음 JSON 형식으로 응답하세요:

{{
  "hashtags": ["#태그1", "#태그2", "#태그3", ...],
  "categories": {{
    "brand": ["#브랜드태그1", "#브랜드태그2"],
    "location": ["#위치태그1", "#위치태그2"],
    "emotion": ["#감정태그1", "#감정태그2"],
    "category": ["#업종태그1", "#업종태그2"],
    "trending": ["#트렌드태그1", "#트렌드태그2"]
  }},
  "reasoning": "태그 선택 근거 설명",
  "compliance": {{
    "forbiddenWords": [],
    "brandGuidelines": ["준수한 가이드라인1", "준수한 가이드라인2"]
  }}
}}
`);
  }

  protected validateInput(input: HashtagGenerationInput): boolean {
    return !!(
      input.postContent &&
      input.storeInfo &&
      input.storeInfo.name &&
      input.storeInfo.category
    );
  }

  protected postProcess(result: string): HashtagGenerationOutput {
    try {
      // JSON 파싱 시도
      const parsed = JSON.parse(result);
      
      // 기본 구조 검증 및 정규화
      return {
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        categories: {
          brand: Array.isArray(parsed.categories?.brand) ? parsed.categories.brand : [],
          location: Array.isArray(parsed.categories?.location) ? parsed.categories.location : [],
          emotion: Array.isArray(parsed.categories?.emotion) ? parsed.categories.emotion : [],
          category: Array.isArray(parsed.categories?.category) ? parsed.categories.category : [],
          trending: Array.isArray(parsed.categories?.trending) ? parsed.categories.trending : []
        },
        reasoning: parsed.reasoning || '태그 생성 완료',
        compliance: {
          forbiddenWords: Array.isArray(parsed.compliance?.forbiddenWords) ? parsed.compliance.forbiddenWords : [],
          brandGuidelines: Array.isArray(parsed.compliance?.brandGuidelines) ? parsed.compliance.brandGuidelines : []
        }
      };
    } catch (error) {
      // JSON 파싱 실패 시 기본 구조 반환
      console.warn('Failed to parse hashtag generation result:', error);
      return {
        hashtags: [],
        categories: {
          brand: [],
          location: [],
          emotion: [],
          category: [],
          trending: []
        },
        reasoning: '태그 생성 중 오류가 발생했습니다',
        compliance: {
          forbiddenWords: [],
          brandGuidelines: []
        }
      };
    }
  }

  /**
   * 라우터를 통해 관련 가이드라인 검색
   */
  private async searchGuidelines(input: HashtagGenerationInput): Promise<{
    guidelines: string;
    forbiddenWords: string;
    brandGuidelines: string;
  }> {
    try {
      // 1. 해시태그 생성 가이드라인 검색
      const guidelinesQuery = `해시태그 생성 가이드라인 ${input.storeInfo.category} 업종`;
      const guidelinesResults = await routerQueryEngine.query(guidelinesQuery);
      
      // 2. 금지어 목록 검색
      const forbiddenQuery = `금지어 목록 ${input.storeInfo.category} 해시태그`;
      const forbiddenResults = await routerQueryEngine.query(forbiddenQuery);
      
      // 3. 브랜드 가이드라인 검색
      const brandQuery = `브랜드 가이드라인 ${input.storeInfo.name} 해시태그`;
      const brandResults = await routerQueryEngine.query(brandQuery);

      return {
        guidelines: guidelinesResults.map(r => r.content).join('\n'),
        forbiddenWords: forbiddenResults.map(r => r.content).join('\n'),
        brandGuidelines: brandResults.map(r => r.content).join('\n')
      };
    } catch (error) {
      console.error('Error searching guidelines:', error);
      return {
        guidelines: '',
        forbiddenWords: '',
        brandGuidelines: ''
      };
    }
  }

  /**
   * 메인 실행 메서드 오버라이드
   */
  public async invoke(input: HashtagGenerationInput): Promise<AIChainResult<HashtagGenerationOutput>> {
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

      // 가이드라인 검색
      const guidelines = await this.searchGuidelines(input);

      // 체인 입력 준비
      const chainInput = {
        postContent: input.postContent,
        storeName: input.storeInfo.name,
        storeCategory: input.storeInfo.category,
        storeLocation: input.storeInfo.location || '미지정',
        storeDescription: input.storeInfo.description || '',
        targetAudience: input.targetAudience || '일반 고객',
        emotion: input.emotion || '중립적',
        maxHashtags: input.maxHashtags || 10,
        guidelines: guidelines.guidelines || '기본 가이드라인 없음',
        forbiddenWords: guidelines.forbiddenWords || '금지어 없음',
        brandGuidelines: guidelines.brandGuidelines || '브랜드 가이드라인 없음'
      };

      // 체인 실행 (재시도 로직 포함)
      let result;
      while (retryCount < this.retryCount) {
        try {
          result = await this.chain.invoke(chainInput);
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

      // 로깅
      this.logExecution('hashtag-generation', input, {
        success: true,
        data: processedResult,
        metadata: {
          model: this.llm.model,
          latency: Date.now() - startTime,
          tokens: this.estimateTokens(chainInput, result),
          retryCount
        }
      });

      return {
        success: true,
        data: processedResult,
        metadata: {
          model: this.llm.model,
          latency: Date.now() - startTime,
          tokens: this.estimateTokens(chainInput, result),
          retryCount
        }
      };

    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          model: this.llm.model,
          latency: Date.now() - startTime,
          tokens: 0,
          retryCount
        }
      };

      this.logExecution('hashtag-generation', input, errorResult);
      return errorResult;
    }
  }

  /**
   * 토큰 수 추정 (간단한 추정)
   */
  private estimateTokensForHashtag(input: any, output: string): number {
    const inputStr = JSON.stringify(input);
    return Math.ceil((inputStr.length + output.length) / 4);
  }
}

// 싱글톤 인스턴스
export const hashtagGenerationChain = new HashtagGenerationChain();
