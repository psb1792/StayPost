import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { BaseAIChain, AIChainResult } from './base-chain';
import { llm } from '../clients';

// 이미지 적합성 판단 결과 스키마
const ImageSuitabilitySchema = z.object({
  suitable: z.boolean().describe('이미지가 가게에 적합한지 여부'),
  score: z.number().min(0).max(100).describe('적합성 점수 (0-100)'),
  issues: z.array(z.string()).default([]).describe('발견된 문제점들'),
  suggestions: z.array(z.string()).default([]).describe('개선 제안사항들'),
  analysis: z.object({
    visualQuality: z.string().describe('시각적 품질 평가'),
    brandAlignment: z.string().describe('브랜드 일치도'),
    targetAudience: z.string().describe('타겟 고객층 적합성'),
    contentAppropriateness: z.string().describe('콘텐츠 적절성')
  }).describe('상세 분석 결과')
});

export type ImageSuitabilityResult = z.infer<typeof ImageSuitabilitySchema>;

// 입력 데이터 타입
export interface ImageSuitabilityInput {
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
}

export class ImageSuitabilityChain extends BaseAIChain<ImageSuitabilityInput, ImageSuitabilityResult> {
  private visionModel: ChatOpenAI;

  constructor() {
    super();
    
    // OpenAI API 키 확인 (프론트엔드와 서버 모두 지원)
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('The OPENAI_API_KEY environment variable is missing or empty');
    }
    
    // Vision 모델 초기화 (GPT-4o 사용)
    this.visionModel = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0.1,
      openAIApiKey: openaiApiKey,
    });
    
    // BaseAIChain의 llm도 visionModel로 업데이트
    this.llm = this.visionModel;
    
    // 체인 초기화
    this.initializeChain();
  }

  protected initializeChain(): void {
    try {
      this.prompt = this.getPromptTemplate();
      
      // LangChain 최신 버전에 맞게 withStructuredOutput 사용법 수정
      try {
        // 먼저 모델에 withStructuredOutput을 적용하고, 그 다음에 prompt를 pipe
        const structuredModel = this.llm.withStructuredOutput(ImageSuitabilitySchema);
        this.chain = this.prompt.pipe(structuredModel);
        console.log('Successfully initialized chain with structured output');
      } catch (structuredError) {
        console.warn('Failed to use withStructuredOutput, falling back to basic chain:', structuredError);
        this.chain = this.prompt.pipe(this.llm);
      }
    } catch (error) {
      console.error('Error initializing ImageSuitabilityChain:', error);
      // 폴백: 일반 체인 사용
      this.chain = this.prompt.pipe(this.llm);
    }
  }

  protected getOutputSchema(): any {
    return ImageSuitabilitySchema;
  }

  protected postProcess(result: any): ImageSuitabilityResult {
    // 결과가 이미 ImageSuitabilityResult 형태라면 그대로 반환
    if (result && typeof result === 'object') {
      // 필수 필드들이 있는지 확인
      if (result.suitable !== undefined && result.score !== undefined) {
        return result as ImageSuitabilityResult;
      }
    }
    
    // 결과가 문자열이라면 JSON 파싱 시도
    if (typeof result === 'string') {
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed as ImageSuitabilityResult;
        }
      } catch (parseError) {
        console.error('JSON parsing error in postProcess:', parseError);
      }
    }
    
    // 기본값 반환
    return {
      suitable: false,
      score: 0,
      issues: ['결과 파싱 실패'],
      suggestions: ['다시 시도해주세요'],
      analysis: {
        visualQuality: '분석 불가',
        brandAlignment: '분석 불가',
        targetAudience: '분석 불가',
        contentAppropriateness: '분석 불가'
      }
    };
  }

  protected getPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      ['system', `당신은 펜션과 숙박업소의 인스타그램 마케팅 전문가입니다. 
이미지와 가게 정보를 종합적으로 분석하여 인스타그램 게시물로 적합한지 판단해주세요.

분석 기준:
1. 시각적 품질: 해상도, 구도, 색감, 조명 등
2. 브랜드 일치도: 가게의 톤앤매너와 일치하는지
3. 타겟 고객층 적합성: 목표 고객이 좋아할 만한 이미지인지
4. 콘텐츠 적절성: 부적절하거나 문제가 될 수 있는 요소가 있는지

결과는 반드시 JSON 형태로만 반환하세요.`],
      ['human', `가게 정보: {storeMeta}
추가 컨텍스트: {context}

이 이미지를 분석해주세요.`]
    ]);
  }

  protected validateInput(input: ImageSuitabilityInput): boolean {
    if (!input.imageUrl || !input.storeMeta) {
      return false;
    }
    
    // 이미지 URL 유효성 검사
    try {
      new URL(input.imageUrl);
    } catch {
      return false;
    }

    // 가게 정보 필수 필드 검사
    if (!input.storeMeta.name || !input.storeMeta.category) {
      return false;
    }

    return true;
  }

  // Vision 모델을 사용한 이미지 분석
  public async invokeWithVision(input: ImageSuitabilityInput): Promise<AIChainResult> {
    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input data'
        };
      }

      // 체인이 초기화되지 않았다면 초기화
      if (!this.chain) {
        this.initializeChain();
      }

      // Vision 모델을 위한 메시지 구성
      const messages = [
        {
          role: 'system' as const,
          content: `당신은 펜션과 숙박업소의 인스타그램 마케팅 전문가입니다. 
이미지와 가게 정보를 종합적으로 분석하여 인스타그램 게시물로 적합한지 판단해주세요.

분석 기준:
1. 시각적 품질: 해상도, 구도, 색감, 조명 등
2. 브랜드 일치도: 가게의 톤앤매너와 일치하는지
3. 타겟 고객층 적합성: 목표 고객이 좋아할 만한 이미지인지
4. 콘텐츠 적절성: 부적절하거나 문제가 될 수 있는 요소가 있는지

결과는 반드시 JSON 형태로만 반환하세요.`
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: `가게 정보: ${JSON.stringify(input.storeMeta)}
추가 컨텍스트: ${input.context ? JSON.stringify(input.context) : '없음'}

이 이미지를 분석해주세요.`
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: input.imageUrl
              }
            }
          ]
        }
      ];

      // Vision 모델 직접 호출
      const result = await this.visionModel.invoke(messages);

      // 결과 파싱
      let parsedResult;
      if (typeof result.content === 'string') {
        try {
          const jsonMatch = result.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            parsedResult = { content: result.content };
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          parsedResult = { content: result.content };
        }
      } else {
        parsedResult = result.content;
      }

      return {
        success: true,
        data: parsedResult
      };

    } catch (error) {
      console.error('ImageSuitabilityChain error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 일반 텍스트 분석 (이미지 없이)
  public async analyzeText(input: Omit<ImageSuitabilityInput, 'imageUrl'>): Promise<AIChainResult> {
    try {
      // 텍스트 분석을 위한 메시지 구성
      const messages = [
        {
          role: 'system' as const,
          content: `당신은 펜션과 숙박업소의 인스타그램 마케팅 전문가입니다. 
가게 정보를 분석하여 인스타그램 게시물로 적합한지 판단해주세요.

분석 기준:
1. 브랜드 일치도: 가게의 톤앤매너와 일치하는지
2. 타겟 고객층 적합성: 목표 고객이 좋아할 만한 콘텐츠인지
3. 콘텐츠 적절성: 부적절하거나 문제가 될 수 있는 요소가 있는지

결과는 반드시 JSON 형태로만 반환하세요.`
        },
        {
          role: 'user' as const,
          content: `가게 정보: ${JSON.stringify(input.storeMeta)}
추가 컨텍스트: ${input.context ? JSON.stringify(input.context) : '없음'}

이 가게 정보를 분석해주세요.`
        }
      ];

      // Vision 모델 직접 호출
      const result = await this.visionModel.invoke(messages);

      // 결과 파싱
      let parsedResult;
      if (typeof result.content === 'string') {
        try {
          const jsonMatch = result.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            parsedResult = { content: result.content };
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          parsedResult = { content: result.content };
        }
      } else {
        parsedResult = result.content;
      }

      return {
        success: true,
        data: parsedResult
      };

    } catch (error) {
      console.error('ImageSuitabilityChain text analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 빠른 이미지 적합성 검사 (Vision 모델 사용하지 않음)
  public async quickCheck(input: ImageSuitabilityInput): Promise<AIChainResult> {
    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input data'
        };
      }

      // 빠른 검사를 위해 가게 정보만 분석
      const result = await this.analyzeText({
        storeMeta: input.storeMeta,
        context: input.context
      });

      return result;

    } catch (error) {
      console.error('ImageSuitabilityChain quickCheck error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
